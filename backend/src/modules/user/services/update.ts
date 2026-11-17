import { updateById, type UserData } from "../db/index.js";

const updateData = async (id: string, data: Partial<Omit<UserData, "id">>) => {
    return await updateById(id, data);
}

export default updateData;
