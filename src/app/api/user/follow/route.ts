import { type NextRequest, NextResponse } from "next/server";
import UserModel from "@/models/user";
import FollowModel from "@/models/follow";
import { HttpStatusCode } from "axios";
import connectMongo from "@/libs/connect-mongo";

export async function POST(request: Request) {
  const followerPk = request.headers.get("user");

  const userData = await request.json();

  await connectMongo();

  const follower = await UserModel.findOne({
    publickey: followerPk,
  });

  const user = await UserModel.findOne({
    publickey: userData.user,
  });

  if (!follower || !user) {
    return NextResponse.json(
      { message: "User Does Not Exist" },
      { status: HttpStatusCode.NotFound }
    );
  }

  const follow = await FollowModel.findOneWithDeleted({
    user: {
      publickey: userData.user,
    },
    follower: {
      publickey: followerPk,
    },
  });

  if (follow && !follow.deleted) {
    user.followers = user.followers === 0 ? 0 : user.followers - 1;
    follower.followings =
      follower.followings === 0 ? 0 : follower.followings - 1;

    await user.save();
    await follower.save();
    await follow.delete();

    return NextResponse.json(
      { success: true, follow: false },
      { status: HttpStatusCode.Ok }
    );
  }

  user.followers++;
  follower.followings++;

  await user.save();
  await follower.save();

  if (follow && follow.deleted) {
    await follow.restore();
    follow.user = user;
    follow.follower = follower;
    await follow.save();
  } else {
    const newFollow = new FollowModel({
      user,
      follower,
    });
    await newFollow.save();
  }

  return NextResponse.json(
    { success: true, follow: true },
    { status: HttpStatusCode.Ok }
  );
}
