import moduleName from 'module';

class ExampleClass {
    constructor() {
        this.value = 10;
    }

    exampleFunction() {
        const x = 5;
        let y = 10;
        var z = 15;
        
        if (x > y) {
            return x;
        } else {
            for (let i = 0; i < z; i++) {
                console.log(i);
            }
        }
        
        while (x < z) {
            x++;
        }
        
    }
}


function exampleFunction() {
    const x = 5;
    let y = 10;
    var z = 15;
    
    if (x > y) {
        return x;
    } else {
        for (let i = 0; i < z; i++) {
            console.log(i);
        }
    }
    
    while (x < z) {
        x++;
    }
}