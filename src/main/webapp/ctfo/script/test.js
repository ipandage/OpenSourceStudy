class5 = (function() {
    // private static fields
    var s_first = 1;
    var s_second = 2;

    // private static methods

    function s_method1() {
        s_first++;
    }


    function constructor() {
        // private fields
        var m_first = 1;
        var m_second = 2;

        // private methods

        function method1() {
            alert(m_first);
        }
        var method2 = function() {
            alert(m_second);
        };

        // public fields
        this.first = "first";
        this.second = ['s', 'e', 'c', 'o', 'n', 'd'];

        // public methods
        this.method1 = function() {
            s_second--;
        };

        this.method2 = function() {
            alert(this.second);
        };

        // constructor
        {
            s_method1();
            this.method1();
        }
    }
    // public static methods
    constructor.method1 = function() {
        s_first++;
        alert(s_first);
    };
    constructor.method2 = function() {
        alert(s_second);
    };

    return constructor;
})();


var obj = function(name) {
    var staticParam = 'staticParam';
    var privateFun = function() {
        alert(staticParam);
    };
    this.name = name;
    this.flag = ['a', 'b'];
    this.showPrivate = function() {
        privateFun();
    };
};

obj.prototype = {
    showname: function() {
        alert(this.name);
    },
    showPrivate: function() {
        this.privateFun();
    }
};

