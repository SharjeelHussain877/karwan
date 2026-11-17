import type { Request, Response } from "express";
import deleteData from "../services/delete.js";

const deleteController = async (req: Request<{ id: string }>, res: Response) => {
    try {
        const { id } = req.params;
        await deleteData(id)
        res.status(200).send({ status: 200, message: 'Data deleted successfully' });
    } catch (err) {
        res.status(500).send({ status: 500, message: 'Internal server error' });
    }
}

export default deleteController;