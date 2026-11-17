import { deleteById } from "../db/index.js";

const deleteData = async (id: string) => {
    return await deleteById(id);
}

export default deleteData;
