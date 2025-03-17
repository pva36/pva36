var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import { Chip8 } from "./chip8.js";
import { Renderer } from "./renderer.js";
import { Keyboard } from "./keyboard.js";
const canvas = document.querySelector("canvas#display");
// const chip8 = new Chip8();
const reader = new FileReader();
const renderer = new Renderer(10, canvas, 64, 32);
const keyboard = new Keyboard(document);
const chip8 = new Chip8(renderer, keyboard);
const romInputButton = document.querySelector("button[id='runGame']");
const submitInstructionForm = document.querySelector("form#runInstruction");
// chip8.sendInstructionToCpu(0x0123);
// chip8.sendInstructionToCpu(0x6120);
// chip8.sendInstructionToCpu(0x6210);
// chip8.sendInstructionToCpu(0xa050);
// chip8.sendInstructionToCpu(0xd125);
/**
 * Main
 */
function main() {
    romInputButton.addEventListener("click", romHandler);
    // event listener for submit instruction
    submitInstructionForm === null || submitInstructionForm === void 0 ? void 0 : submitInstructionForm.addEventListener("submit", (e) => {
        e.preventDefault();
        const formInput = document.querySelector("input#chip8instruction");
        const instruction = formInput.value;
        const regex = /^0x[\da-fA-F]{4}/;
        if (regex.test(instruction)) {
            chip8.sendInstructionToCpu(parseInt(instruction));
        }
        else {
            alert("Please enter a instruction in the format specified");
        }
    });
}
/**
 * Functions -----------------------------------------------------------------
 */
function romHandler() {
    return __awaiter(this, void 0, void 0, function* () {
        const romInput = document.querySelector("input[type='file']");
        sendBinary(romInput);
    });
}
function sendBinary(inputElement) {
    return __awaiter(this, void 0, void 0, function* () {
        if (typeof inputElement === null) {
            // TODO: find a better error message for an end user
            throw Error("input element that get the binary file is null");
        }
        else {
            const inputElementVer = inputElement;
            // console.log("in else of 'sendBinary'");
            if (inputElementVer.files.length < 1) {
                alert("Please select a file from your compute!");
            }
            else {
                // TODO: test that the file IS a CHIP ROM.
                const binaryFile = inputElementVer.files[0];
                // initialize the reader object
                reader.onload = (event) => {
                    let data = event.target.result;
                    let array = new Uint8Array(data);
                    // console.log([].map.call(array, (x: number) => x.toString(16)));
                    // pass the array to the chip8 object
                    chip8.fetchBinary(array);
                };
                reader.onerror = (event) => {
                    console.error("Error: ", event.type);
                };
                // pass binaryFile to the reader object
                reader.readAsArrayBuffer(binaryFile);
            }
        }
    });
}
main();
