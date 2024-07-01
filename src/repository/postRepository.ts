import PostModel from "../models/postModel";

export const PostRepository = {
    createPost: async (userId: string, image: string, description: string) => {
        try {
            const post = await PostModel.create({
                userId,
                image,
                description
            })
            console.log('rep', post);
            return true
        } catch (err) {
            console.error(`Error finding while posting: ${err}`);
            return null;
        }
    },
    like: async (userdId: string, postId: string) => {
        try {
            const updatedResult = await PostModel.updateOne({ _id: postId }, { $addToSet: { likes: { userId: userdId } } })
            return true
        } catch (err) {
            console.error(`Error liking while posting: ${err}`);
            return null;
        }
    },
    dislike: async (userdId: string, postId: string) => {
        try {
            const updatedResult = await PostModel.updateOne({ _id: postId }, { $pull: { likes: { userId: userdId } } })
            return true
        } catch (err) {
            console.error(`Error liking while posting: ${err}`);
            return null;
        }
    },
    commentPost: async (userdId: string, postId: string, comment: string) => {
        try {
            const updatedResult = await PostModel.updateOne({ _id: postId }, { $push: { comments: { userId: userdId, content: comment } } })
            const updatedPost = await PostModel.findOne({ _id: postId })
            return updatedPost
        } catch (err) {
            console.error(`Error liking while posting: ${err}`);
            return null;
        }
    },
    deleteComment: async (postId: string, commentId: string) => {
        try {
            const response = await PostModel.updateOne({ _id: postId }, {
                $pull: { comments: { _id: commentId } }
            })
            if (!response) {
                return { success: false }
            }
            return { success: true }
        } catch (err) {
            console.error(`Error deleting comment post: ${err}`);
            return null;
        }
    },
    report: async (postId: string, reason: string, userId: string) => {
        try {
            const response = await PostModel.updateOne({ _id: postId }, {
                $addToSet: { reported: { userId: userId, reason: reason } }
            })
            if (!response) {
                return { success: false }
            }
            return { success: true }
        } catch (err) {
            console.error(`Error deleting comment post: ${err}`);
            return null;
        }
    },
    getreportedpost: async () => {
        try {
            const reportedPosts = await PostModel.aggregate([
                {
                    $match: {
                        reported: { $exists: true, $ne: [] },
                        $or: [
                            { isDeleted: { $exists: false } },
                            { isDeleted: false }
                        ]
                    }
                }
            ]);
            return reportedPosts;

        } catch (err) {
            console.error(`Error fetching reported post: ${err}`);
            return null;
        }
    },
    getuserpost: async (userId: string) => {
        try {
            const posts = await PostModel.find({ userId: userId, isDeleted: { $ne: true } })
            return posts || [];
        } catch (err) {
            console.error(`Error fetching user post: ${err}`);
            return null;
        }
    },
    deletePost: async (postId: string) => {
        try {
            const posts = await PostModel.updateOne({ _id: postId }, { $set: { isDeleted: true } })
            return { success: true }
        } catch (err) {
            console.error(`Error fetching user post: ${err}`);
            return null;
        }
    },
    editPost: async (postId: string, description: string) => {
        try {
            const posts = await PostModel.updateOne({ _id: postId }, { $set: { description: description } })
            return { success: true }
        } catch (err) {
            console.error(`Error fetching user post: ${err}`);
            return null;
        }
    },
    getChartDetails: async (currentYear: number, month: number) => {
        try {
            const userStats = await PostModel.aggregate([
                {
                    $match: {
                        $expr: {
                            $eq: [{ $year: "$createdAt" }, currentYear]
                        },
                        isDeleted: {
                            $ne: true
                        }
                    }
                },
                {
                    $group: {
                        _id: {
                            month: { $month: "$createdAt" },
                        },
                        count: { $sum: 1 }
                    }
                },
                {
                    $sort: {
                        "_id.month": 1
                    }
                },
                {
                    $project: {
                        _id: 0,
                        month: "$_id.month",
                        count: 1
                    }
                }

            ])
            const result = Array.from({ length: month + 1 }, (_, i) => ({
                month: i + 1,
                count: 0
            }));
            userStats.forEach(stat => {
                const index = result.findIndex(r => r.month == stat.month);
                if (index !== -1) {
                    result[index].count = stat.count;
                }
            });
            let count = await PostModel.find({ isDeleted: { $ne: true } }).countDocuments();
            return { result, count }
        } catch (err) {
            console.error(`Error fetching chart: ${err}`);
            return null;
        }
    },
}
