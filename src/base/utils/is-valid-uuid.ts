export const isValidUuid = (uuid: any) => {
  const regex = new RegExp(
    '^[0-9a-fA-F]{8}\\b-[0-9a-fA-F]{4}\\b-[0-9a-fA-F]{4}\\b-[0-9a-fA-F]{4}\\b-[0-9a-fA-F]{12}$',
  );
  return regex.test(uuid);
};
