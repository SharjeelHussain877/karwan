import type { Request, Response } from "express";
import postData from "../services/post.js";
import jwt from "jsonwebtoken";

const postController = async (req: Request, res: Response) => {
  try {
    console.log("req.body", req.body);
    //  new
    const token = jwt.sign(
      { result: req.body.email },
      "abra_ka_dabra_gili_gili_chu"
    );
    res.cookie("authToken", token, { httpOnly: true });
    // end
    const data = await postData(req.body);
    res.status(200).send({ status: 200, data, token });
  } catch (err) {
    console.log("err", err);
    res
      .status(500)
      .send({ status: 500, message: 'Internal server error' });
  }
};

export default postController;
