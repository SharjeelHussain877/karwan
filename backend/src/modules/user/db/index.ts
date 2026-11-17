
export type UserData = {
    id: string;
    name: string;
    email: string;
    role: string;
  };
  
  const users: UserData[] = [
    {
      id: "1",
      name: "Sharjeel Hussain",
      email: "sharjeel@example.com",
      role: "admin"
    },
    {
      id: "2",
      name: "John Doe",
      email: "john@example.com",
      role: "user"
    }
  ];
  
  const getAll = async (): Promise<UserData[]> => {
    return users;
  };
  
  const addData = async (data: Omit<UserData, "id">): Promise<UserData> => {
    const newUser: UserData = {
      id: String(Date.now()),
      ...data
    };
  
    users.push(newUser);
  
    return newUser;
  };
  
  const deleteById = async (id: string): Promise<UserData | null> => {
    const index = users.findIndex((user) => user.id === id);
  
    if (index === -1) return null;
  
    const [deleted] = users.splice(index, 1);
    return deleted ?? null;
  };
  
  const updateById = async (
    id: string,
    data: Partial<Omit<UserData, "id">>
  ): Promise<UserData | null> => {
    const user = users.find((user) => user.id === id);
  
    if (!user) return null;
  
    Object.assign(user, data);
  
    return user;
  };
  
  export {
    getAll,
    addData,
    deleteById,
    updateById
  };
  