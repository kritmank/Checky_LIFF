const paramMissing = (data, params) => {
    const missingKeys = params.filter(param => data[param] === undefined);
    const message = `Missing parameter: ${missingKeys.join(", ")}`;

    if (missingKeys.length) {
        return [true, { code: 400, message }];
    }
    return [false, null];
}

export default paramMissing;