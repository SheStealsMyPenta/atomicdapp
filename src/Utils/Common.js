export function getRandomNumber() {
    // 随机选择 3、4 或 5
    const digits = Math.floor(Math.random() * 3) + 3;

    // 计算最小值和最大值
    const min = Math.pow(10, digits - 1);
    const max = Math.pow(10, digits) - 1;

    // 生成范围内的随机数
    const randomNumber = Math.floor(Math.random() * (max - min + 1)) + min;

    return randomNumber;
}

export function convertToAsciiHex(number) {
    // 将数字转换为字符串
    const str = number.toString();

    // 遍历字符串，将每个字符转换为对应的ASCII码的16进制表示，并添加0x前缀
    const asciiHexArray = Array.from(str).map(char => '0x' + char.charCodeAt(0).toString(16));

    return asciiHexArray
}
export function displayCustomString(str) {
    console.log('str',str);
    console.log(typeof str);
    if (str.length < 10 || typeof str !=='string') {
        return "Invalid String!";
    }
    return str.slice(0, 6) + "..." + str.slice(-4);
}
export function hashToByteArray(hash) {
    const byteArray = [];
    for (let i = 0; i < hash.length; i += 2) {
        const hexByte = hash.slice(i, i + 2);
        byteArray.push(`0x${hexByte}`);
    }
    return byteArray;
}