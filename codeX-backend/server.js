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
        const { contestKey, problemLetter } = req.params;
        const contest = await Contest.findOne({ contestKey: contestKey });
        if (!contest) {
            return res.status(404).json({ message: 'Contest not found' });
        }

        const problem = await Problem.findOne({ contestId: contest._id, problemLetter: problemLetter }).select('-hiddenTestCases');

        if (!problem) {
            return res.status(404).json({ message: 'Problem not found' });
        }

        res.json(problem);
    } catch (error) {
        res.status(500).json({ message: 'Server error while fetching problem details' });
    }
});

//background process for submission
const processSubmission = async (submissionId) => {
    try {
        const submission = await Submission.findById(submissionId);
        if (!submission || !submission.judge0Tokens || submission.judge0Tokens.length === 0) {
            console.log(`[Processor] Submission ${submissionId} already processed or invalid.`);
            return;
        }

        console.log(`[Processor] Starting to process submission ${submissionId}`);
        const tokens = submission.judge0Tokens.join(',');
        
        let isProcessing = true;
        while (isProcessing) {
            await new Promise(resolve => setTimeout(resolve, 2000));

            const judge0Response = await axios.get(
                `${JUDGE0_API_URL}/submissions/batch?tokens=${tokens}&base64_encoded=true&fields=*`
            );
            const results = judge0Response.data.submissions;

            
            const stillProcessing = results.some(r => r.status.id === 1 || r.status.id === 2);

            if (!stillProcessing) {
                isProcessing = false;
                
                // final verdict
                let finalVerdict = 'Accepted';
                let maxTime = 0;
                let maxMemory = 0;
                let testCasesPassed = 0;

                for (const result of results) {
                    maxTime = Math.max(maxTime, parseFloat(result.time || 0));
                    maxMemory = Math.max(maxMemory, result.memory || 0);
                    if (result.status.id === 3) {
                        testCasesPassed++;
                    } else {
                        if (finalVerdict === 'Accepted') {
                            finalVerdict = result.status.description;
                        }
                    }
                }
                submission.status = finalVerdict;
                submission.verdict = finalVerdict;
                submission.executionTime = maxTime;
                submission.memory = maxMemory;
                submission.testCasesPassed = testCasesPassed;
                submission.totalTestCases = results.length;
                submission.judge0Tokens = [];
                await submission.save();
                console.log(`[Processor] Finished processing submission ${submissionId}. Verdict: ${finalVerdict}`);
            }
        }
    } catch (error) {
        console.error(`[Processor] Error processing submission ${submissionId}:`, error);
        await Submission.findByIdAndUpdate(submissionId, {
            status: 'Internal Server Error',
            verdict: 'Internal Server Error',
            judge0Tokens: []
        });
    }
};

app.post('/api/submit', auth, async (req, res) => {
    const { languageId, code, problemId } = req.body;
    const teamname = req.team.teamname;

    try {
        if (!code || !languageId || !problemId) {
            return res.status(400).json({ message: "Missing required fields: code, languageId, or problemId" });
        }

        const problem = await Problem.findById(problemId);
        if (!problem) {
            return res.status(404).json({ message: "Problem not found." });
        }

        if (!problem.hiddenTestCases || problem.hiddenTestCases.length === 0) {
            return res.status(400).json({ message: "This problem has no hidden test cases and cannot be judged." });
        }

        const submissions = problem.hiddenTestCases.map(testCase => ({
            language_id: parseInt(languageId),
            source_code: Buffer.from(code).toString('base64'),
            stdin: Buffer.from(testCase.input).toString('base64'),
            expected_output: Buffer.from(testCase.output).toString('base64'),
            cpu_time_limit: problem.timeLimit,
            memory_limit: problem.memoryLimit * 1024,
        }));

        const judge0Response = await axios.post(
            `${JUDGE0_API_URL}/submissions/batch?base64_encoded=true`,
            { submissions: submissions },
            { headers: { 'Content-Type': 'application/json' } }
        );

        const judge0Tokens = judge0Response.data.map(s => s.token);

        const newSubmission = new Submission({
            teamname,
            problemId,
            code,
            languageId: parseInt(languageId),
            judge0Tokens: judge0Tokens,
            status: 'In Queue',
            verdict: 'In Queue',
        });

        await newSubmission.save();

        processSubmission(newSubmission._id);

        res.status(201).json({
            message: "Submission received and is being processed.",
            submissionId: newSubmission._id,
        });

    } catch (error) {
        if (error.response) {
            console.error("Error from Judge0:", error.response.data);
        } else {
            console.error("Error Message:", error.message);
        }
        res.status(500).json({
            message: 'Server error during submission.',
            error: error.message
        });
    }
});

app.get('/api/submissions/:submissionId', auth, async (req, res) => {
    try {
        const submission = await Submission.findById(req.params.submissionId);

        if (!submission) {
            return res.status(404).json({ message: 'Submission not found' });
        }
        
        return res.json({
            status: submission.verdict,
            details: {
                status: { description: submission.verdict },
                time: submission.executionTime,
                memory: submission.memory,
            },
            testCasesPassed: submission.testCasesPassed,
            totalTestCases: submission.totalTestCases
        });

    } catch (error) {
        console.error('Error fetching submission status:', error);
        res.status(500).json({ message: 'Error fetching submission status.' });
    }
});

app.get('/api/submissions', auth, async (req, res) => {
    try {
        const submissions = await Submission.find({})
            .populate({
                path: 'problemId',
                select: 'title problemLetter contestId',
                populate: {
                    path: 'contestId',
                    select: 'contestKey'
                }
            })
            .sort({ submittedAt: -1 });
        res.json(submissions);
    } catch (error) {
        console.error("Error fetching submissions:", error);
        res.status(500).json({ message: "Server error while fetching submissions." });
    }
});

app.get('/api/scoreboard/:contestKey', auth, async (req, res) => {
	try {
		const { contestKey } = req.params;
		const contest = await Contest.findOne({ contestKey: contestKey }).populate('problems');
		if (!contest) {
			return res.status(404).json({ message: 'Contest not found' });
		}

		const contestStartTime = new Date(contest.startTime);
		const PENALTY_MINUTES = 10;

		const submissions = await Submission.find({ problemId: { $in: contest.problems.map(p => p._id) } }).sort({ submittedAt: 'asc' });

		const teamScores = {};
        const teams = await Team.find({});
        for (const team of teams) {
            if (team.role === 'admin') continue; // exclude admin from scoreboard
            teamScores[team.teamname] = {
                teamname: team.teamname,
                problemsSolved: 0,
                totalScore: 0,
                totalTime: 0,
                solvedProblems: {},
                penaltyAttempts: {},
            };
        }

		for (const sub of submissions) {
			if (!sub.teamname || !teamScores[sub.teamname]) continue;
			
			const problemId = sub.problemId.toString();
            const team = teamScores[sub.teamname];

			if (team.solvedProblems[problemId]) {
				continue;
			}

			if (sub.verdict === 'Accepted') {
				const problem = contest.problems.find(p => p._id.toString() === problemId);
				if (!problem) continue;

				const timeToSolve = (new Date(sub.submittedAt) - contestStartTime) / (1000 * 60);
				const penalty = (team.penaltyAttempts[problemId] || 0) * PENALTY_MINUTES;

				team.problemsSolved++;
				team.totalScore += problem.score;
				team.totalTime += timeToSolve + penalty;
				team.solvedProblems[problemId] = true;

			} else if (sub.verdict && sub.verdict !== 'Accepted' && sub.verdict !== 'In Queue' && sub.verdict !== 'Processing') {
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
		res.status(500).json({message:"Server error."});
		}
	});

app.listen(PORT);