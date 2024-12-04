const express = require('express');
const router = express.Router();
const Weight = require('../models/weightModel');
const isAuthenticated = require('../middleware/authMiddleware');
// POST: Calculate weight difference between two dates
router.post('/difference',isAuthenticated, async (req, res) => {
    try {
        // console.log('POST request received at /weights/ajax/difference');
        const { date1, date2 } = req.body;
        const userId = req.session.userId;

         // Find weights for the given dates for the logged-in user

        const startOfDay1 = new Date(date1).setHours(0, 0, 0, 0);
        const endOfDay1 = new Date(date1).setHours(23, 59, 59, 999);

        const startOfDay2 = new Date(date2).setHours(0, 0, 0, 0);
        const endOfDay2 = new Date(date2).setHours(23, 59, 59, 999);

        const weight1 = await Weight.findOne({
            userId,
            date: { $gte: startOfDay1, $lte: endOfDay1 },
        });
        const weight2 = await Weight.findOne({
            userId,
            date: { $gte: startOfDay2, $lte: endOfDay2 },
        });

        if (!weight1 || !weight2) {
            return res.status(404).json({ error: 'Weight not found for one or both dates' });
        }

        const weightDifference = Math.abs(weight1.weight - weight2.weight);

        res.json({
            weight1: weight1.weight,
            weight2: weight2.weight,
            difference: weightDifference,
        });
    } catch (error) {
        console.error('Error calculating weight difference:', error);
        res.status(500).json({ error: 'An error occurred while calculating the weight difference.' });
    }
});

module.exports = router;
