import lzString from 'lz-string';

function simplify(saveData) {
    const lines = saveData.lines.map(line => {
        const points = line.points.map(pt => [Number(pt.x.toFixed(4)), Number(pt.y.toFixed(4))]);
        return { ...line, points };
    });
    return { ...saveData, lines };
}

function desimplify(saveData) {
    const lines = saveData.lines.map(line => {
        const points = line.points.map(([x, y]) => ({ x, y }));
        return { ...line, points };
    });
    return { ...saveData, lines };
}

export function compressSaveData(saveData) {
    const data = JSON.parse(saveData);
    const json = JSON.stringify(simplify(data));
    return lzString.compressToUTF16(json);
}

export function decompressSaveData(compressedSaveData) {
    const decompressed = lzString.decompressFromUTF16(compressedSaveData);
    const data = desimplify(JSON.parse(decompressed));
    return JSON.stringify(data);
}
