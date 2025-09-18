const mongoose = require('mongoose');
const express = require('express');
const bcyrpt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const axios = require('axios');
const cors = require("cors");
require('dotenv').config();
const app = express();

const Team = require('./models/Team');
const Contest = require('./models/Contest');
const Problem = require('./models/Problem')
const Submission = require('./models/Submission')

const PORT = process.env.PORT;
const DB_URI = process.env.MONGO_URI;
const JWT_SECRET = process.env.JWT_SECRET;

app.use(express.json())
app.use(cors())

mongoose.connect(DB_URI).then(
	()=>console.log("connection successful")).catch(
	(err)=>console.error(err,"connection failed"))


app.post('/api/register', async (req,res)=>{
	try {
		const {teamname, password} = req.body;

		const existingTeam = await Team.findOne({teamname});
		if (existingTeam){
			return res.status(409).json({message:'Team already exits'})
		}
		const salt = await bcyrpt.genSalt(10);
		const hashedPassword = await bcyrpt.hash(password,salt);

		const newTeam = new Team({
			teamname: teamname,
			password: hashedPassword
		});

		await newTeam.save();

		res.status(201).json({message:'Team created successfully'})

	} catch(error) {
		console.log(error)
		res.status(500).json({message:'Error registering team'})
	}
});

app.post('/api/login', async (req,res) => {
	try {
		const {teamname, password} = req.body;

		const team = await Team.findOne({teamname});
		if (!team) {
			return res.status(404).json({message:'Team not found.'})
		}
		const isMatch = await bcyrpt.compare(password, team.password);
		if (!isMatch) {
			return res.status(401).json({message:'Incorrect password'})
		}
		const payload = {
			team: {
				id: team.id,
				teamname: team.teamname
			}
		};

		
		jwt.sign(
			payload,
			JWT_SECRET,
			{expiresIn:'1m'}, //later change this to '3h' or '3.5hrs'
			(err, token) => {
				if (err) throw err;
				res.json({token})
			}
		)

	} catch(error) {
		res.status(500).json({message:error})
	}
})

const auth = (req, res , next) => {
	const token = req.header('x-auth-token'); //getting token from header

	if (!token) {
		return res.status(401).json({message:'Authorization denied, no token'})
	}
	
	try {
		const decoded = jwt.verify(token,JWT_SECRET);
		req.team = decoded.team;
		next();
	} catch (error) {
		res.status(401).json({message:'Token is not valid'})
	}
}

app.post('/api/submit', auth, async (req,res) => {
	const {languageId, code, problemId } = req.body;
	const teamId = req.team.id;

	try {
		const judge0Response = await axios.post(`${process.env.JUDGE0_API_URL}/submissions?base64_encoded=false&wait=false`,{
			source_code: code,
			language_id: languageId,
		});
		const judge0Token = judge0Response.data.token;

		const newSubmission = new Submission({
			teamId,
			problemId,
			code,
			languageId,
			judge0Token: judge0Token,
			status: 'Pending',
		})

		await newSubmission.save();

		res.status(201).json({ 
			message: "Submission received and is being processed.",
			submissionId: newSubmission.id,
			judge0Token: judge0Token 
		});
	} catch (error) {
		res.status(500).json({message:'Server error during submission'})
	}
})
app.get('/api/status/:submissionId',auth, async (req,res) => {
	try {
		const submission = await Submission.findById(req.params.submissionId);

		if (!submission) {
			return res.status(404).json({message:'Submission not found'})
		}

		if (!submission.judge0Token) {
			return res.json({status:submission.status,details: {}});
		}
		//fetching results
		const judge0Response = await axios.get(`${process.env.JUDGE0_API_URL}/submissions/${submission.judge0Token}?base64_encoded=false`);
		const statusId = judge0Response.data.status.id;

		if (statusId === 1 || statusId === 2) {
			const currentStatus = judge0Response.data.status.description;
			submission.status = currentStatus;
			await submission.save();
			return res.json({status: currentStatus, details: judge0Response.data});
		}

		const finalStatus = judge0Response.data.status.description;
		submission.status = finalStatus;
		submission.judge0Token = null;
		await submission.save();

		res.json({status:finalStatus,details:judge0Response.data});

	} catch (error) {
		console.error('Error fetching status:', error);
		res.status(500).json({message:'Error fetching submission status.'});
	}
})
app.get('/api/scoreboard/:contestId', auth, async (req, res) => {
	try {
		const { contestId } = req.params;
		// fetch the contest start time from a Contest model.
		// assume time
		const contestStartTime = new Date('2025-09-12T19:30:00Z');
		const PENALTY_MINUTES = 10;

		// 1. Fetch all submissions sorted by time
		const submissions = await Submission.find({ problemId: { $regex: `^${contestId}-` } })
			.populate('teamId', 'teamname') // Fetch the teamname from the User model
			.sort({ submittedAt: 'asc' });

		const teamScores = {};

		// 2. Process each submission
		for (const sub of submissions) {
			if (!sub.teamId) continue;
			const teamId = sub.teamId._id.toString();
			const problemId = sub.problemId;

			// Initialize team if they are not in the scores object yet
			if (!teamScores[teamId]) {
				teamScores[teamId] = {
					teamname: sub.teamId.teamname,
					problemsSolved: 0,
					totalTime: 0,
					solvedProblems: {}, // Tracks solved problems to avoid double counting
					penaltyAttempts: {}, // Tracks wrong attempts per problem
				};
			}
			
			const team = teamScores[teamId];

			// If this problem is already solved, skip this submission
			if (team.solvedProblems[problemId]) {
				continue;
			}

			if (sub.status === 'Accepted') {
				const timeToSolve = (sub.submittedAt - contestStartTime) / (1000 * 60); // in minutes
				const penalty = (team.penaltyAttempts[problemId] || 0) * PENALTY_MINUTES;

				team.problemsSolved++;
				team.totalTime += timeToSolve + penalty;
				team.solvedProblems[problemId] = true;

			} else {
			// Increment penalty attempts for this problem
				team.penaltyAttempts[problemId] = (team.penaltyAttempts[problemId] || 0) + 1;
			}
		}

		// 3. Convert the scores object to an array and rank it
		const rankedScoreboard = Object.values(teamScores).sort((a, b) => {
			// Sort by problems solved (descending)
			if (b.problemsSolved !== a.problemsSolved) {
				return b.problemsSolved - a.problemsSolved;
			}
			// If problems solved are equal, sort by total time (ascending)
			return a.totalTime - b.totalTime;
		});

		res.json(rankedScoreboard);

	} catch (error) {
		console.error("Error generating scoreboard:", error);
		res.status(500).json({message:"Server error."});
		}
	});

app.listen(PORT);