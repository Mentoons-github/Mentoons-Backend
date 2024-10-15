const Job = require("../models/jobs");
const User = require("../models/user");
const JobApplication = require("../models/jobApplication");
const Product = require("../models/products");

const getAnalytics = async () => {
    try {
        const totalJobs = await Job.countDocuments();
        const totalUsers = await User.countDocuments();
        const totalJobApplications = await JobApplication.countDocuments();
        const totalProducts = await Product.countDocuments();
        const salesData = await Product.aggregate([
            {
                $group: {
                    _id: { $month: "$createdAt" },
                    count: { $sum: 1 }
                }
            },
            {
                $project: {
                    _id: 0,
                    month: {
                        $switch: {
                            branches: [
                                { case: { $eq: ["$_id", 1] }, then: "Jan" },
                                { case: { $eq: ["$_id", 2] }, then: "Feb" },
                                { case: { $eq: ["$_id", 3] }, then: "Mar" },
                                { case: { $eq: ["$_id", 4] }, then: "Apr" },
                                { case: { $eq: ["$_id", 5] }, then: "May" },
                                { case: { $eq: ["$_id", 6] }, then: "Jun" },
                                { case: { $eq: ["$_id", 7] }, then: "Jul" },
                                { case: { $eq: ["$_id", 8] }, then: "Aug" },
                                { case: { $eq: ["$_id", 9] }, then: "Sep" },
                                { case: { $eq: ["$_id", 10] }, then: "Oct" },
                                { case: { $eq: ["$_id", 11] }, then: "Nov" },
                                { case: { $eq: ["$_id", 12] }, then: "Dec" }
                            ],
                            default: "Unknown"
                        }
                    },
                    sales: "$count"
                }
            },
            { $sort: { _id: 1 } }
        ]);

        return {
            totalJobs,
            totalUsers, 
            totalJobApplications,
            totalProducts,
            salesData
        };  
    }
    catch (error) {
        throw error;
    }
}

module.exports = {
    getAnalytics
};