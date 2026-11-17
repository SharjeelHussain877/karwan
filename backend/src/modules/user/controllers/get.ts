import type { Request, Response } from "express";
import getData from "../services/get.js";

const getController = async (_req: Request, res: Response) => {
    try {
        const users = await getData()
        res.status(200).send({ status: 200, data: users });
    } catch (err) {
        res.status(500).send({ status: 500, message: 'Internal server error' });
    }
}

export default getController;
