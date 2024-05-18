import mongoose, { Document, Schema } from "mongoose";

interface Comment {
    userId: string;
    content: string;
    createdAt: Date;
}

interface Like {
    userId: string;
    createdAt: Date;
}


export interface Post extends Document {
    userId?: string;
    image: string;
    description?: string;
    comments?: Comment[];
    likes?: Like[];
    createdAt: Date;
}


const PostSchema: Schema<Post> = new Schema({
    userId: {
        type: Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    image: {
        type: String, required: true
    },
    description: {
        type: String, required: true
    },
    comments: [
        {
            userId: {
                type: Schema.Types.ObjectId, ref: "User", required: true
            },
            content: {
                type: String, required: true
            },
            createdAt: {
                type: Date, default: Date.now
            }
        }
    ],
    likes: [
        {
            userId: {
                type: Schema.Types.ObjectId,
                ref: "User", required: true
            },
            createdAt: {
                type: Date, default: Date.now
            }
        }
    ],
    createdAt: { type: Date, default: Date.now }
});

const PostModel = mongoose.model<Post>("Post", PostSchema);

export default PostModel;
