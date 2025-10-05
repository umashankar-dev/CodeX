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
const JUDGE0_API_URL = process.env.JUDGE0_API_URL;

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
		//first acc is 'admin' by default and rest are 'users'
		const isFirstAccount = (await Team.countDocuments()) === 0;  //change to teamname === 'admin'
		const role = (isFirstAccount || teamname === 'admin') ? 'admin' : 'user'; 

		const newTeam = new Team({
			teamname: teamname,
			password: hashedPassword,
			role: role,
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
				id: team._id,
				teamname: team.teamname,
				role: team.role,
			}
		};
		
		jwt.sign(
			payload,
			JWT_SECRET,
			{expiresIn:'3.5hrs'}, //later change this to '3h' or '3.5hrs'
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
//admin auth middleware
const adminAuth = (req, res, next) => {
	auth(req, res, () => {
		if (req.team.role !== 'admin') {
			return res.status(403).json({ message: 'Forbidden: Admin access required.' });
        }
		next();
	});
}

app.post('/api/contests', adminAuth, async (req, res) => {
	try {
		const {name, startTime, contestKey, duration} = req.body;
		const newContest = new Contest({
			name: name,
			contestKey: contestKey,
			startTime:startTime,
			duration:duration,
		});
		await newContest.save();
		res.status(201).json(newContest);
	} catch (error) {
		res.status(500).json({message:'Error while creating contest',error:error})
	}
});

app.post('/api/contests/:contestKey/problems', adminAuth, async (req, res) => {
	try {
		const {contestKey} = req.params;
		const { title, description, problemLetter, constraints, timeLimit, memoryLimit, sampleTestCases, hiddenTestCases, score} = req.body;
		const contestId = await Contest.findOne({contestKey:contestKey});
		const newProblem = new Problem({
			contestId,
			title,
			problemLetter,
			description,
			constraints,
			timeLimit,
			memoryLimit,
			sampleTestCases,
			hiddenTestCases,
			score
		});
		await newProblem.save();
		await Contest.findByIdAndUpdate(
			contestId,
			{$push: {problems: newProblem._id}},
			{new: true}); //returns updated values
		res.status(201).json(newProblem)
	} catch (error) {
		res.status(500).json({message:'Error while adding the problem',error:error})
	}
})

//User routes
app.get('/api/contests',auth, async (req, res) => {
	try {
		const contests = await Contest.find({}).populate('problems').sort({ startTime: -1 });
		res.json(contests)
	} catch (error) {
		res.status(500).json({ message: 'Server error while fetching contests' });
	}
})
app.get('/api/contests/:contestKey', auth, async (req, res) => {
    try {
        const contest = await Contest.findOne({contestKey:req.params.contestKey})
            .populate('problems', '-hiddenTestCases'); 

        if (!contest) {
            return res.status(404).json({ message: 'Contest not found' });
        }

        res.json(contest);
    } catch (error) {
        res.status(500).json({ message: 'Server error while fetching contest details' });
    }
});

app.get('/api/contests/:contestKey/problems/', auth, async (req, res) => {
    try {
		const {contestKey} = req.params;
		const contestId = await Contest.findOne({contestKey:contestKey});
		const problems = await Problem.find({contestId:contestId}).select('-hiddenTestCases')
		

        if (!problems) {
            return res.status(404).json({ message: 'No problems found' });
        }

        res.json(problems);
    } catch (error) {
        res.status(500).json({ message: 'Server error while fetching problem details' });
    }
});

app.get('/api/contests/:contestKey/problems/:problemLetter', auth, async (req, res) => {
    try {
        const problem = await Problem.findOne({problemLetter:req.params.problemLetter}).select('-hiddenTestCases');

        if (!problem) {
            return res.status(404).json({ message: 'Problem not found' });
        }

        res.json(problem);
    } catch (error) {
        res.status(500).json({ message: 'Server error while fetching problem details' });
    }
});

app.post('/api/submit', auth, async (req,res) => {
	const {languageId, code, problemId } = req.body;
	const teamId = req.team.id;

	try {
		const judge0Response = await axios.post(`${JUDGE0_API_URL}/submissions?base64_encoded=false&wait=false`,{
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
app.get('/api/submissions/:submissionId',auth, async (req,res) => {
	try {
		const submission = await Submission.findById(req.params.submissionId);

		if (!submission) {
			return res.status(404).json({message:'Submission not found'})
		}

		if (!submission.judge0Token) {
			return res.json({status:submission.status,details: {}});
		}
		//fetching results
		const judge0Response = await axios.get(`${JUDGE0_API_URL}/submissions/${submission.judge0Token}?base64_encoded=false`);
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
app.get('/api/scoreboard/:contestKey', auth, async (req, res) => {
	try {
		const contestKey = req.params;
		const contestId = await Contest.findOne({contestKey:contestKey})
		const contest = await Contest.findById(contestId).populate('problems');
		if (!contest) {
			return res.status(404).json({ message: 'Contest not found' });
		}

		const contestStartTime = new Date(contest.startTime);
		const PENALTY_MINUTES = 10;

		const submissions = await Submission.find({ problemId: { $in: contest.problems.map(p => p._id) } })
			.populate('teamId', 'teamname')
			.sort({ submittedAt: 'asc' });

		const teamScores = {};

		for (const sub of submissions) {
			if (!sub.teamId) continue;
			const teamId = sub.teamId._id.toString();
			const problemId = sub.problemId.toString();

			if (!teamScores[teamId]) {
				teamScores[teamId] = {
					teamname: sub.teamId.teamname,
					problemsSolved: 0,
					totalScore: 0,
					totalTime: 0,
					solvedProblems: {},
					penaltyAttempts: {},
				};
			}
			
			const team = teamScores[teamId];

			if (team.solvedProblems[problemId]) {
				continue;
			}

			if (sub.status === 'Accepted') {
				const problem = contest.problems.find(p => p._id.toString() === problemId);
				if (!problem) continue;

				const timeToSolve = (sub.submittedAt - contestStartTime) / (1000 * 60);
				const penalty = (team.penaltyAttempts[problemId] || 0) * PENALTY_MINUTES;

				team.problemsSolved++;
				team.totalScore += problem.score;
				team.totalTime += timeToSolve + penalty;
				team.solvedProblems[problemId] = true;

			} else {
				team.penaltyAttempts[problemId] = (team.penaltyAttempts[problemId] || 0) + 1;
			}
		}

		const rankedScoreboard = Object.values(teamScores).sort((a, b) => {
			if (b.totalScore !== a.totalScore) {
				return b.totalScore - a.totalScore;
			}
			return a.totalTime - b.totalTime;
		});

		res.json(rankedScoreboard);

	} catch (error) {
		console.error("Error generating scoreboard:", error);
		res.status(500).json({message:"Server error."});
		}
	});

app.listen(PORT);