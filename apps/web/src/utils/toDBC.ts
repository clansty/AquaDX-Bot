export default (str: string) => {
	str = String(str == null ? '' : str);
	let result = '';
	for (let i = 0; i < str.length; i++) {
		if (str.charCodeAt(i) == 12288) {
			result += String.fromCharCode(str.charCodeAt(i) - 12256);
		} else if (str.charCodeAt(i) > 65280 && str.charCodeAt(i) < 65375) {
			result += String.fromCharCode(str.charCodeAt(i) - 65248);
		} else {
			result += String.fromCharCode(str.charCodeAt(i));
		}
	}
	return result;
}
