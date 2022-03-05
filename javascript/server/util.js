// add val to the first empty space in arr and return the index
function insert(arr, val) {
	for (i = 0; i < arr.length; i++) {
		if (arr[i] == undefined) {
			arr[i] = val;
			return i;
		}
	}

	arr.push(val);
	return (arr.length - 1);
}

exports.insert = insert