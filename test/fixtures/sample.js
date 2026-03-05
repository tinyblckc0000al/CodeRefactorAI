// Sample code with smells for testing

// Smell 1: Unused variable
const unusedVar = "this is never used";

function longFunction() {
    // Smell 2: Long function - this has many lines
    let result = 0;
    for (let i = 0; i < 100; i++) {
        result += i;
    }
    if (result > 50) {
        console.log("big");
    }
    if (result > 60) {
        console.log("bigger");
    }
    if (result > 70) {
        console.log("biggest");
    }
    if (result > 80) {
        console.log("too big");
    }
    if (result > 90) {
        console.log("really too big");
    }
    return result;
}

// Smell 3: Magic number
function calculatePrice(quantity) {
    return quantity * 100; // 100 should be a constant
}

// Smell 4: Console.log in production
function process() {
    console.log("debug info");
    return true;
}

// Import example
import { something } from './module';
import Other from 'other-module';

class User {
    constructor(name) {
        this.name = name;
    }
    
    getName() {
        return this.name;
    }
}

export default User;
