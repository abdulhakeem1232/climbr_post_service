import { response } from "express";
import { PostRepository } from "../repository/postRepository";

export const postService = {
    deleteComment: async (postId: string, commentId: string) => {
        try {
            let response = await PostRepository.deleteComment(postId, commentId)
            return response
        } catch (err) {
            console.error(`Error post comment deletig: ${err}`);
            return null;
        }
    },
    report: async (postId: string, reason: string, userId: string) => {
        try {
            let response = await PostRepository.report(postId, reason, userId)
            return response
        } catch (err) {
            console.error(`Error post comment deletig: ${err}`);
            return null;
        }
    },
    deletePost: async (postId: string) => {
        try {
            let response = await PostRepository.deletePost(postId)
            return response
        } catch (err) {
            console.error(`Error post comment deletig: ${err}`);
            return null;
        }
    }
}
