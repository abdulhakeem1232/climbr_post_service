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
}
