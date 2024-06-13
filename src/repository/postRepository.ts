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
            return true
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
                        reported: { $exists: true, $ne: [] }
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
}
