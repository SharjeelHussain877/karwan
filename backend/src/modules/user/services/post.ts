import { addData, type UserData } from "../db/index.js";

const postData = async (data: Omit<UserData, "id">) => {
    return await addData(data);
}

export default postData;
