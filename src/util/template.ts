export default (data: Record<string, any>) => {
  return (str: string) =>
    new Function(`{${Object.keys(data).join(",")}}`, "return `" + str + "`")(
      data
    );
};
