const debug = require('debug')('LocalDictionary')
const name = 'Local Dictionary'
debug('Booting %s', name)

function Trie(parent, prev, key, value) {
    if (key !== void 0)
        this.key = key;      // single-character key
    if (value !== void 0)
        this.value = value;  // user-defined value
    if (prev)
        prev.next = this;    // next sibling node
    else if (parent)
        parent.child = this; // first child node
}

Trie.prototype.getAuto = function (name, node, arr, dataarr) {

    if (name.length < 3)
        return -1;

    if (node == null) {
        node = this;
    }

    if (arr == null) {
        arr = []
    }

    if (dataarr == null) {
        dataarr = []
    }

    var i = 0, node = this.child, len = name.length;
    var parent;
    while (i < len) {
        
        if (typeof node == 'undefined') {
            return -1;
        }

        if (node.key == name[i]) {
            parent = node;
            node = node.child;
            ++i;
        } else {
            parent = node;
            node = node.next;
        }
     }
	 
    var res = Trie.prototype.getAllForAuto(parent,name, arr, dataarr);
    return res;
} 

Trie.prototype.getAllForAuto = function (node, name, arr, dataarr) {

    var str = name.substring(0, name.length-1);

        if (node == null) {
            node = this;
        }

        if (arr == null) {
            arr = []
        }

        if (dataarr == null) {
            dataarr = []
        }

    if (typeof node.key != 'undefined') {
        arr.push(node.key);
    }

    if (node.child) {

        Trie.prototype.getAllForAuto(node.child,name, arr, dataarr);
        var t = node.child;
        while (true) {
            if (typeof t.next == 'undefined') {
                break;
            }
            else {
                Trie.prototype.getAllForAuto(t.next, name,arr, dataarr);
                t = t.next;
            }
        }
    }
                           
    if (!node.child) {
        arr.push(node.key);
        var newObj = arr.join("");
        dataarr.push(str.concat(newObj));
    }

    arr.pop()

    return dataarr;
       
}

Trie.prototype.getAllWords = function(node, arr, dataarr) {
		
	if (node == null) {
		node = this;
	}
	
	if(arr == null) {
		arr = []
	}
	
	if(dataarr == null) {
		dataarr = []
	}
	
	if (typeof node.key != 'undefined') {
			arr.push(node.key);
	}
	
	if (node.child) {

		Trie.prototype.getAllWords(node.child, arr, dataarr);
		var t = node.child;
		while (true) {
			if(typeof t.next == 'undefined') {
				break;
			}
			else {
				Trie.prototype.getAllWords(t.next, arr, dataarr);
				t = t.next;
			}
		}
	}

	if (!node.child) {
		arr.push(node.key);
		var newObj = {'word':arr.join(""), 'value':node.value};
		dataarr.push(newObj);
	}
	
	arr.pop()
	
	return dataarr;
}

// put a key/value pair in the trie
Trie.prototype.put = function(name, value) {
    var i = 0, t = this, len = name.length, prev, parent;
    down: while (t.child) {
        parent = t;
        t = t.child;
        // if first child didn't match, get next sibling
        while (t.key != name[i]) {
            if (!t.next) {
                prev = t;
                t = parent;
                break down;
            }
            t = t.next;
        }
        // key already exists, update the value
        if (++i > len) {
            t.value = value;
            return;
        }
    }
    // found any existing parts of the key, add the rest
    t = new this.constructor(t, prev, name[i]);
    while (++i <= len)
        t = new this.constructor(t, null, name[i]);
    t.name = name;
    t.value = value;
};

// get a value from the trie at the given key
Trie.prototype.get = function(name) {
    var i = 0, t = this.child, len = name.length;
    while (t) {
        if (t.key == name[i]) {
            if (i == len)
                return t.value;
            t = t.child;
            ++i;
        } else {
            t = t.next;
        }
    }
	
	return -1;
};

module.exports = Trie;