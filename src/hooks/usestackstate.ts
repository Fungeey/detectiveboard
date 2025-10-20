import { useState } from "react";

// Unused, created in order to understand useundostack.ts

const maxSize = 50;

const useStackState = () => {
  let [stack, setStack] = useState([]);

  // adds a newest item
  function push(item) {
    // if(stack.length >= maxSize)
    //     shift();

    let newStack = [...stack];
    newStack.push(item);
    setStack(newStack);
  }

  // pops from the front (oldest item)
  function shift() {
    let newStack = [...stack];

    // the oldest item is returned, but forgotten
    newStack.shift();
    setStack(newStack);
  }

  // returns the newest item
  function pop() {
    let newStack = [...stack];
    let popped = newStack.pop();

    setStack(newStack);
    return popped;
  }

  return [push, pop];
}

export default useStackState;