export default (str: string) => {
  return (data: Record<string, string>) =>
    new Function(`{${Object.keys(data).join(",")}}`, "return `" + str + "`")(
      data
    );
};
