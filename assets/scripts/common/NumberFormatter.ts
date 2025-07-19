/**
 * @class NumberFormatter
 * @description 一个用于精简显示大数字的工具类。
 *
 * @example
 * NumberFormatter.format(1234);         // "1.2k"
 * NumberFormatter.format(1234567);      // "1.2m"
 * NumberFormatter.format(1234567, 2);   // "1.23m"
 * NumberFormatter.format(999);          // "999"
 * NumberFormatter.format(-25000);       // "-25k"
 */
export class NumberFormatter {

    /**
     * 定义数字单位的层级，从大到小排列。
     * 't' 代表 Trillion (万亿), 'b' 代表 Billion (十亿), 'm' 代表 Million (百万), 'k' 代表 Thousand (千)。
     * 在游戏中，'b' 比 'g' (Giga) 更常用。
     */
    private static readonly tiers = [
        { value: 1e12, symbol: 't' },
        { value: 1e9,  symbol: 'b' },
        { value: 1e6,  symbol: 'm' },
        { value: 1e3,  symbol: 'k' },
    ];

    /**
     * 格式化数字，将其转换为带有 k, m, b, t 后缀的精简形式。
     * @param num 要格式化的数字。
     * @param precision 保留的小数位数，默认为 1。
     * @returns 格式化后的字符串。
     */
    public static format(num: number, precision: number = 1): string {
        // 对于绝对值小于1000的数字，直接返回原样字符串，无需格式化
        if (Math.abs(num) < 1000) {
            return num.toString();
        }

        // 寻找合适的单位层级
        // find() 方法会返回数组中第一个满足测试函数的元素
        const tier = this.tiers.find(t => Math.abs(num) >= t.value);

        // 如果找到了合适的层级
        if (tier) {
            // 计算相对值，例如 12345 对于 'k' 层级，相对值是 12.345
            const value = num / tier.value;

            // 使用 toFixed() 来控制小数精度，然后用 parseFloat() 去掉末尾多余的 .0
            // 例如 2000 / 1000 = 2，toFixed(1) -> "2.0"，parseFloat -> 2
            // 例如 2500 / 1000 = 2.5，toFixed(1) -> "2.5"，parseFloat -> 2.5
            const formattedValue = parseFloat(value.toFixed(precision));

            // 拼接数值和单位符号
            return formattedValue + tier.symbol;
        }

        // 理论上，因为有前面的 < 1000 判断，代码不会执行到这里，但作为保障返回原始数字
        return num.toString();
    }
}