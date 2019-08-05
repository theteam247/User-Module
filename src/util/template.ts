export default (str: string) => {
  return (data: Record<string, any>) =>
    new Function(`{${Object.keys(data).join(",")}}`, "return `" + str + "`")(
      data
    );
};
