import {Filter} from "../types/types";

const getWereByUserId = async (
  id: number,
  whereClause: Filter[]
): Promise<Filter[]> => {
  whereClause.push({
    field: "userId",
    operator: "==",
    value: id,
  });

  return whereClause;
};

export default getWereByUserId;
