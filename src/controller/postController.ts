import { Request } from "express";
import { PostRepository } from "../repository/postRepository";
import { S3Client, PutObjectCommand, GetObjectCommand } from "@aws-sdk/client-s3";
import dotenv from 'dotenv'
import crypto from 'crypto'
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import PostModel from "../models/postModel";
import sharp from 'sharp'
import { postService } from "../services/postServices";


dotenv.config()

const randomImageName = (bytes = 32) => crypto.randomBytes(bytes).toString('hex')
const access_key = process.env.ACCESS_KEY
const secret_access_key = process.env.SECRET_ACCESS_KEY
const bucket_region = process.env.BUCKET_REGION
const bucket_name = process.env.BUCKET_NAME
if (!access_key || !secret_access_key) {
    throw new Error("AWS credentials are not provided.");
}
const s3: S3Client = new S3Client({
    credentials: {
        accessKeyId: access_key,
        secretAccessKey: secret_access_key
    },
    region: process.env.BUCKET_REGION
});


export const postController = {
    createPost: async (call: any, callback: any) => {
        try {
            const imageName = randomImageName()
            console.log('inpostcreate', call.request);
            const buffer = await sharp(call.request.image.buffer).resize({ height: 1080, width: 1920, fit: "cover" }).toBuffer()
            const params = {
                Bucket: bucket_name,
                Key: imageName,
                Body: buffer,
                ContetType: call.request.image.mimetype,
            }
            const command = new PutObjectCommand(params)
            await s3.send(command)
            let response = await PostRepository.createPost(call.request.userId, imageName, call.request.description)
            console.log(response, 'response');

            callback(null, response)
        } catch (err) {
            callback(err);
        }
    },
    getallpost: async (call: any, callback: any) => {
        try {
            console.log('call-------', call.request);
            const { page, limit } = call.request;
            const skip = (page - 1) * limit;
            console.log(skip, page, limit, '9090909090');

            let posts = await PostModel.find({ isDeleted: { $ne: true } }).sort({ createdAt: -1 }).skip(skip).limit(limit)
            for (let post of posts) {
                const getObjectParams = {
                    Bucket: bucket_name,
                    Key: post.image,
                }

                const getObjectCommand = new GetObjectCommand(getObjectParams);
                const url = await getSignedUrl(s3, getObjectCommand, { expiresIn: 3600 });
                post.image = url
            }
            console.log(posts, 'get all post----');
            const response = {
                posts: posts
            };

            callback(null, response);
        } catch (err) {
            callback(err);
        }
    },
    likePost: async (call: any, callback: any) => {
        try {
            console.log('c000000', call.request);
            const { userId, postId } = call.request;
            let response = await PostRepository.like(userId, postId);
            callback(null, response)
        } catch (err) {
            callback(err);
        }
    },
    DislikePost: async (call: any, callback: any) => {
        try {
            console.log('c111', call.request);
            const { userId, postId } = call.request;
            let response = await PostRepository.dislike(userId, postId);
            callback(null, response)
        } catch (err) {
            callback(err);
        }
    },
    CommentPost: async (call: any, callback: any) => {
        try {
            console.log('c111', call.request);
            const { userId, postId, comment } = call.request;
            let response = await PostRepository.commentPost(userId, postId, comment);
            callback(null, response)
        } catch (err) {
            callback(err);
        }
    },
    deleteComment: async (call: any, callback: any) => {
        try {
            const { postId, commentId } = call.request
            let response = await postService.deleteComment(postId, commentId)
            callback(null, response)
        } catch (err) {
            callback(err);
        }
    },
    reportPost: async (call: any, callback: any) => {
        try {
            console.log(call.request);
            const { postId, reason, userId } = call.request;
            let response = await postService.report(postId, reason, userId)
            callback(null, response)
        } catch (err) {
            callback(err);
        }
    },
    getReportedPost: async (call: any, callback: any) => {
        try {
            let posts = await PostRepository.getreportedpost()
            if (posts) {
                for (let post of posts) {
                    const getObjectParams = {
                        Bucket: bucket_name,
                        Key: post.image,
                    }

                    const getObjectCommand = new GetObjectCommand(getObjectParams);
                    const url = await getSignedUrl(s3, getObjectCommand, { expiresIn: 3600 });
                    post.image = url
                }
            }
            const response = {
                posts: posts
            };
            callback(null, response);
        } catch (err) {
            callback(err);
        }
    },
    getUserPost: async (call: any, callback: any) => {
        try {
            const { userId } = call.request;
            let posts = await PostRepository.getuserpost(userId)
            if (posts) {
                for (let post of posts) {
                    const getObjectParams = {
                        Bucket: bucket_name,
                        Key: post.image,
                    }

                    const getObjectCommand = new GetObjectCommand(getObjectParams);
                    const url = await getSignedUrl(s3, getObjectCommand, { expiresIn: 3600 });
                    post.image = url
                }
            }
            const response = {
                posts: posts
            };
            callback(null, response);
        } catch (err) {
            callback(err);
        }
    },
    deletePost: async (call: any, callback: any) => {
        try {
            const { postId } = call.request
            let response = await postService.deletePost(postId)
            callback(null, response);
        } catch (err) {
            callback(err);
        }
    },
    editPost: async (call: any, callback: any) => {
        try {

            console.log(call.request);
            const { postId, description } = call.request
            let response = await PostRepository.editPost(postId, description)
        } catch (err) {
            callback(err);
        }
    },

}
