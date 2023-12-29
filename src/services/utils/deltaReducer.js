export default function messageReducer(previous, item) {
    const reduce = (acc, delta) => {
      acc = { ...acc };
      for (const [key, value] of Object.entries(delta)) {
        if (acc[key] === undefined || acc[key] === null) {
          acc[key] = value;
          if (Array.isArray(acc[key])) {
            for (const arr of acc[key]) {
              delete arr.index;
            }
          }
        } else if (typeof acc[key] === 'string' && typeof value === 'string') {
          acc[key] += value;
        } else if (typeof acc[key] === 'number' && typeof value === 'number') {
          acc[key] = value;
        } else if (Array.isArray(acc[key]) && Array.isArray(value)) {
          const accArray = acc[key];
          for (let i = 0; i < value.length; i++) {
            const { index, ...chunkTool } = value[i];
            if (index - accArray.length > 1) {
              throw new Error(
                `Error: An array has an empty value when tool_calls are constructed. tool_calls: ${accArray}; tool: ${value}`,
              );
            }
            accArray[index] = reduce(accArray[index], chunkTool);
          }
        } else if (typeof acc[key] === 'object' && typeof value === 'object') {
          acc[key] = reduce(acc[key], value);
        }
      }
      return acc;
    };
    return reduce(previous, item?.choices?.[0]?.delta);
  }