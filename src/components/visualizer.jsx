import React, { useState, useEffect, useCallback } from 'react';

// algorithms
import { bubbleSort } from './algorithms/bubbleSort.js';
import { insertionSort } from './algorithms/insertionSort.js';
import { selectionSort } from './algorithms/selectionSort.js';
import { mergeSort } from './algorithms/mergeSort.js';
import { quickSort } from './algorithms/quickSort.js';



// components
import Navbar from './navbar';
import Frame from './frame';
// import Footer from './footer';

// helpers
import pause from './helper/pause';
import generator from './helper/generator';
import { ALGORITHM, SPEED, SIZE, SWAP, CURRENT, NORMAL, DONE } from './helper/constants';
import { getKeysCopy } from './helper/keys.js';

const Visualizer = () => {
    const [list, setList] = useState([]);
    const [size, setSize] = useState(10);
    const [speed, setSpeed] = useState(1);
    const [algorithm, setAlgorithm] = useState(1);
    const [running, setRunning] = useState(false);

    const generateList = useCallback((value = 0) => {
        if ((list.length !== size && !running) || Number(value) === 1) {
            let newList = generator(size);
            setList(newList);
        }
    }, [list.length, running, size]);

    // for initial generation of list
    useEffect(() => {
        generateList();
    }, [generateList]);

    // for updating the state on changing navbar options
    // avoid changing algorithm and size when algorithm is running
    const onChange = useCallback((value, option) => {
        if (option === ALGORITHM && !running) {
            setAlgorithm(Number(value));
        } else if (option === SPEED) {
            setSpeed(Number(value));
        } else if (option === SIZE && !running) {
            setSize(Number(value));
            generateList();
        }
    }, [running, generateList]);

    // select and run the corresponding algorithm  
    const start = async () => {
        lock(true);
        let moves = await getMoves(algorithm);
        await visualizeMoves(moves);
        await done();
        lock(false);
    };

    // get moves for corresponding algorithms
    const getMoves = async (Name) => {
        let moves = [];
        let array = await getKeysCopy(list, size);
        if (Name === 1) {
            moves = await bubbleSort(array, array.length);
        }
        if (Name === 2) {
            moves = await selectionSort(array, array.length);
        }
        if (Name === 3) {
            moves = await insertionSort(array, array.length);
        }
        if (Name === 4) {
            moves = await mergeSort(array, array.length);
        }
        if (Name === 5) {
            moves = await quickSort(array, array.length);
        }
     
        return moves;
    };

    // for visualizing obtained moves
    const visualizeMoves = async (moves) => {
        if (moves.length === 0) {
            return;
        }
        // if move length if 4, then we have to handle range part
        if (moves[0].length === 4) {
            await visualizeMovesInRange(moves);
        } else {
            await visualizeMovesBySwapping(moves);
        }
    };

    // for visualizing range based sorting algorithms
    const visualizeMovesInRange = async (Moves) => {
        let prevRange = [];
        while (Moves.length > 0 && Moves[0].length === 4) {
            // change range only when required to avoid blinking
            if (prevRange !== Moves[0][3]) {
                await updateElementClass(prevRange, NORMAL);
                prevRange = Moves[0][3];
                await updateElementClass(Moves[0][3], CURRENT);
            }
            await updateElementValue([Moves[0][0], Moves[0][1]]);
            Moves.shift();
        }
        await visualizeMoves(Moves);
    };

    // for visualizing swapping based sorting algorithms
    const visualizeMovesBySwapping = async (Moves) => {
        while (Moves.length > 0) {
            let currMove = Moves[0];
            // if container doesn't contains 3 elements then return
            if (currMove.length !== 3) {
                await visualizeMoves(Moves);
                return;
            } else {
                let indexes = [currMove[0], currMove[1]];
                await updateElementClass(indexes, CURRENT);
                if (currMove[2] === SWAP) {
                    await updateList(indexes);
                }
                await updateElementClass(indexes, NORMAL);
            }
            Moves.shift();
        }
    };

    // swapping the values for current move
    const updateList = async (indexes) => {
        let array = [...list];
        let stored = array[indexes[0]].key;
        array[indexes[0]].key = array[indexes[1]].key;
        array[indexes[1]].key = stored;
        await updateStateChanges(array);
    };

    // update value of list element
    const updateElementValue = async (indexes) => {
        let array = [...list];
        array[indexes[0]].key = indexes[1];
        await updateStateChanges(array);
    };

    // update classType of list element
    const updateElementClass = async (indexes, classType) => {
        let array = [...list];
        for (let i = 0; i < indexes.length; ++i) {
            array[indexes[i]].classType = classType;
        }
        await updateStateChanges(array);
    };

    // Updating the state attribute list every time on modification
    const updateStateChanges = async (newList) => {
        setList(newList);
        await pause(speed);
    };

    // To block changing of navbar options when the algorithm is running
    const lock = (status) => {
        setRunning(Boolean(status));
    };

    // Mark list as done
    const done = async () => {
        let indexes = [];
        for (let i = 0; i < size; ++i) {
            indexes.push(i);
        }
        await updateElementClass(indexes, DONE);
    };

    // For responsive navbar
    const response = () => {
        let Navbar = document.querySelector(".navbar");
        if (Navbar.className === "navbar") Navbar.className += " responsive";
        else Navbar.className = "navbar";
    };

    return (
        <React.Fragment>
            <Navbar
                start={start}
                response={response}
                newList={generateList}
                onChange={onChange}
            />
            <Frame
                list={list}
            />
            {/* <Footer /> */}
        </React.Fragment>
    );
};

export default Visualizer;
