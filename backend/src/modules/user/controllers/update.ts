import type { Request, Response } from "express";
import updateData from "../services/update.js";

const updateController = async (req: Request<{ id: string }>, res: Response) => {
    try {
        const { id } = req.params;
        await updateData(id, req.body)
        res.status(200).send({ status: 200, message: 'Data updated successfully' });
    } catch (err) {
        res.status(500).send({ status: 500, message: 'Internal server error' });
    }
}

export default updateController;
