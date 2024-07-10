import dotenv from 'dotenv'
import path from 'path'
import * as grpc from "@grpc/grpc-js";
import * as protoLoader from "@grpc/proto-loader";
import { connectDB } from './config/db';
import { postController } from './controller/postController';

dotenv.config()
connectDB()

const packageDefinition = protoLoader.loadSync(path.join(__dirname, "proto/post.proto"))
const postProto = grpc.loadPackageDefinition(packageDefinition) as any;

const server = new grpc.Server();
const Domain = process.env.NODE_ENV === 'dev' ? "0.0.0.0" : process.env.PRO_DOMAIN_POST


const grpcServer = () => {
  server.bindAsync(
    `${Domain}:${process.env.POST_PORT}`,
    grpc.ServerCredentials.createInsecure(),
    (err, port) => {
      if (err) {
        console.log(err, "error happened grpc user service");
        return;
      }
      console.log("grpc user server started on port:", port);
    }
  );
};

server.addService(postProto.PostServices.service, {
  CreatePost: postController.createPost,
  GetAllPost: postController.getallpost,
  PostLike: postController.likePost,
  PostDisLike: postController.DislikePost,
  PostComment: postController.CommentPost,
  DeleteComment: postController.deleteComment,
  ReportPost: postController.reportPost,
  GetReportedPost: postController.getReportedPost,
  GetUserPost: postController.getUserPost,
  DeletePost: postController.deletePost,
  EditPost: postController.editPost,
  GetReports: postController.getChartDetails,
})

grpcServer();
