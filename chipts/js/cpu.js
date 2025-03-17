export class Cpu {
    /**
     * Run
     */
    static cpuRun(ch8) {
        ch8.pc = 0x200;
        ch8.runningLoops[ch8.runningLoops.length] = setInterval(() => {
            // set instruction:
            let highByte = ch8.memory[ch8.pc];
            let lowByte = ch8.memory[ch8.pc + 1];
            let instruction = 0 | (highByte << 8);
            instruction = instruction | lowByte;
            Cpu.processInstruction(instruction, ch8);
            if (!ch8.skipAutoPc) {
                ch8.pc += 2; // increment after each operation
            }
            ch8.skipAutoPc = false;
            if (ch8.delayTimer > 0) {
                ch8.delayTimer--;
            }
            if (ch8.soundTimer > 0) {
                ch8.soundTimer--;
            }
        });
    }
    /**
     * Switches ----------------------------------------------------------------
     */
    static processInstruction(instruction, ch8) {
        // console.log(`executing instruction '${instruction.toString(16)}'`);
        // check that instruction is one byte (I want to be very careful);
        if (instruction < 0 && instruction > 0xffff) {
            throw Error("Chip8's CPU cannot handle instructions that aren't 16-bit (2 bytes) long");
        }
        else {
            // get the first nibble
            let firstNibble = instruction & 0xf000;
            switch (firstNibble) {
                case 0x0000:
                    Cpu.processInstruction0(instruction, ch8);
                    break;
                case 0x1000:
                    Cpu.jp1nnn(instruction, ch8);
                    break;
                case 0x2000:
                    Cpu.call2nnn(instruction, ch8);
                    break;
                case 0x3000:
                    Cpu.se3xkk(instruction, ch8);
                    break;
                case 0x4000:
                    Cpu.sne4xkk(instruction, ch8);
                    break;
                case 0x5000:
                    Cpu.se5xy0(instruction, ch8);
                    break;
                case 0x6000:
                    Cpu.ld6xkk(instruction, ch8);
                    break;
                case 0x7000:
                    Cpu.add7xkk(instruction, ch8);
                    break;
                case 0x8000:
                    Cpu.processInstruction8(instruction, ch8);
                    // console.error(`0x8nnn not implemented`);
                    break;
                case 0x9000:
                    Cpu.sne9xy0(instruction, ch8);
                    break;
                case 0xa000:
                    Cpu.ldAnnn(instruction, ch8);
                    break;
                case 0xb000:
                    Cpu.jpBnnn(instruction, ch8);
                    break;
                case 0xc000:
                    Cpu.rndCxkk(instruction, ch8);
                    break;
                case 0xd000:
                    Cpu.drwDxyn(instruction, ch8);
                    break;
                case 0xe000:
                    Cpu.processInstructionE(instruction, ch8);
                    break;
                case 0xf000:
                    Cpu.processInstructionF(instruction, ch8);
                    break;
                default:
                    throw Error("Error at the entry switch!");
            }
        }
    }
    static processInstruction0(instruction, ch8) {
        let secondNibble = instruction & 0x0f00;
        switch (secondNibble) {
            case 0x0100:
            case 0x0200:
            case 0x0300:
            case 0x0400:
            case 0x0500:
            case 0x0600:
            case 0x0700:
            case 0x0800:
            case 0x0900:
            case 0x0a00:
            case 0x0b00:
            case 0x0c00:
            case 0x0d00:
            case 0x0e00:
                Cpu.processInstructionE(instruction, ch8);
            case 0x0f00:
                Cpu.sys0nnn(instruction, ch8);
                break;
            case 0x0000:
                let thirdFourthNibble = instruction & 0x00ff;
                switch (thirdFourthNibble) {
                    case 0x00e0:
                        Cpu.cls00E0(ch8);
                        break;
                    case 0x00ee:
                        Cpu.ret00EE(ch8);
                        break;
                    default:
                        Cpu.sys0nnn(instruction, ch8);
                    // throw Error(
                    //   "Error at switch 0x00--: " +
                    //     `cannot handle instruction ${instruction.toString(16)}`,
                    // );
                }
                break;
            default:
                throw Error("Error at switch of 0x0---");
        }
    }
    static processInstruction8(instruction, ch8) {
        const fourthNibble = instruction & 0x000f;
        switch (fourthNibble) {
            case 0:
                Cpu.ld8xy0(instruction, ch8);
                break;
            case 1:
                Cpu.or8xy1(instruction, ch8);
                break;
            case 2:
                Cpu.and8xy2(instruction, ch8);
                break;
            case 3:
                Cpu.xor8xy3(instruction, ch8);
                break;
            case 4:
                Cpu.add8xy4(instruction, ch8);
                break;
            case 5:
                Cpu.sub8xy5(instruction, ch8);
                break;
            case 6:
                Cpu.shr8xy6(instruction, ch8);
                break;
            case 7:
                Cpu.subn8xy7(instruction, ch8);
                break;
            case 0xe:
                Cpu.shl8xyE(instruction, ch8);
                break;
            default:
                throw Error(`unknown instruction hex: ${instruction.toString(16)}`);
        }
    }
    static processInstructionE(instruction, ch8) {
        const secondByte = instruction & 0x00ff;
        switch (secondByte) {
            case 0x9e:
                Cpu.skpEx9E(instruction, ch8);
                break;
            case 0xa1:
                Cpu.sknpExA1(instruction, ch8);
                break;
            default:
                console.warn(`Illegal instruction 0x${instruction.toString(16)}.`);
        }
    }
    static processInstructionF(instruction, ch8) {
        const secondByte = instruction & 0x00ff;
        switch (secondByte) {
            case 0x07:
                Cpu.ldFx07(instruction, ch8);
                break;
            case 0x0a:
                Cpu.ldFx0A(instruction, ch8);
                break;
            case 0x15:
                Cpu.ldFx15(instruction, ch8);
                break;
            case 0x18:
                Cpu.ldFx18(instruction, ch8);
                break;
            case 0x1e:
                Cpu.addFx1E(instruction, ch8);
                break;
            case 0x29:
                Cpu.ldFx29(instruction, ch8);
                break;
            case 0x33:
                Cpu.ldFx33(instruction, ch8);
                break;
            case 0x55:
                Cpu.ldFx55(instruction, ch8);
                break;
            case 0x65:
                Cpu.ldFx65(instruction, ch8);
                break;
            default:
                console.warn(`illegal instruction 0x${instruction.toString(16)}.`);
                break;
        }
    }
    /**
     * Instructions ------------------------------------------------------------
     */
    static sys0nnn(instruction, ch8) {
        const address = 0x0fff & instruction;
        ch8.pc = address;
        ch8.skipAutoPc = true;
    }
    static cls00E0(ch8) {
        ch8.clearDisplay();
    }
    static ret00EE(ch8) {
        // Return from a subroutine.
        // The interpreter sets the program counter to the address at the top of
        // the stack, then subtracts 1 from the stack pointer.
        // set pc to address at the top of the stack
        ch8.pc = ch8.getStack(ch8.sp);
        // ch8.skipAutoPc = true;
        // the previous instruction (commented) doesn't apply because we need the
        // interpreter to return to the instruction and consider it the instruction
        // of the current iteration, so the automatic increment of the program
        // counter must occur in order to continue the normal execution of the
        // program.
        // subtracts 1 from the stack pointer.
        ch8.sp -= 1;
    }
    static jp1nnn(instruction, ch8) {
        // the interpreter sets the program counter to `nnn`
        let address = instruction & 0x0fff;
        ch8.pc = address;
        ch8.skipAutoPc = true;
    }
    static call2nnn(instruction, ch8) {
        // Call subroutine at nnn
        // The interpreter increments the stack pointer, then puts the current PC
        // on the top of the stack. The PC is then set to nnn
        const address = instruction & 0x0fff;
        ch8.sp++;
        ch8.setStack(ch8.sp, ch8.pc);
        ch8.pc = address;
        ch8.skipAutoPc = true;
    }
    static se3xkk(instruction, ch8) {
        // Skip next instruction if Vx = kk;
        // The interpreter compares register Vx to kk, and if they are equal,
        // increments the program counter by 2.
        const kk = instruction & 0x00ff;
        const x = (instruction & 0x0f00) >> 8;
        const vx = ch8.getV(x);
        if (vx === kk) {
            ch8.pc += 2;
        }
    }
    static sne4xkk(instruction, ch8) {
        // Skip next instruction if Vx != kk.
        // The interpreter compares register Vx to kk, and if they are not equal,
        // increments the program counter by 2.
        const x = (instruction & 0x0f00) >> 8;
        const kk = instruction & 0x00ff;
        if (ch8.getV(x) !== kk) {
            ch8.pc += 2;
        }
    }
    static se5xy0(instruction, ch8) {
        // Skip next instruction if Vx = Vy
        // The interpreter compares register Vx to register Vy, and if they are
        // equal, increments the program counter by 2.
        const x = (instruction & 0x0f00) >> 8;
        const y = (instruction & 0x00f0) >> 4;
        if (ch8.getV(x) === ch8.getV(y)) {
            ch8.pc += 2;
        }
    }
    static ld6xkk(instruction, ch8) {
        // Set Vx = kk.
        // The intepreter puts the value kk into register Vx.
        const value = instruction & 0x00ff;
        const index = (instruction & 0x0f00) >> 8;
        ch8.setV(index, value);
    }
    static add7xkk(instruction, ch8) {
        // Set Vx = Vx + kk
        // Adds the value kk to the value of register Vx, then stores the result in Vx.
        const value = instruction & 0x00ff;
        const index = (instruction & 0x0f00) >> 8;
        const currentValue = ch8.getV(index);
        ch8.setV(index, value + currentValue);
    }
    static ld8xy0(instruction, ch8) {
        // Set Vx = Vy
        // Stores the value of register Vy in register Vx.
        const x = (instruction & 0x0f00) >> 8;
        const y = (instruction & 0x00f0) >> 4;
        const value = ch8.getV(y);
        ch8.setV(x, value);
    }
    static or8xy1(instruction, ch8) {
        // Set Vx = Vx OR Vy.
        // Performs a bitwise OR on the values of Vx and Vy, then stores the result
        // in Vx. A bitwise OR compares the corresponding bits from two values, and
        // if either bit is 1, then the same bit in the result is also 1. Otherwise,
        // it is 0.
        const x = (instruction & 0x0f00) >> 8;
        const y = (instruction & 0x00f0) >> 4;
        const vxValue = ch8.getV(x);
        const vyValue = ch8.getV(y);
        const finalValue = vxValue | vyValue;
        ch8.setV(x, finalValue);
    }
    static and8xy2(instruction, ch8) {
        // Set Vx = Vx AND Vy.
        // Performs a bitwise AND on the values of Vx and Vy, then stores the result
        // in Vx. A bitwise AND compares the corresponding bits from two values, and
        // if both bits are 1, then the same bit in the result is also 1. Otherwise,
        // it is 0.
        const x = (instruction & 0x0f00) >> 8;
        const y = (instruction & 0x00f0) >> 4;
        const vxValue = ch8.getV(x);
        const vyValue = ch8.getV(y);
        const finalValue = vxValue & vyValue;
        ch8.setV(x, finalValue);
    }
    static xor8xy3(instruction, ch8) {
        // Set Vx = Vx XOR Vy.
        // Performs a bitwise exclusive OR on the values of Vx and Vy, then stores
        // the result in Vx. An exclusive OR compares the corresponding bits from
        // two values, and if the bits are not both the same, then the
        // corresponding bit in the result is set to 1. Otherwise, it is 0.
        const x = (instruction & 0x0f00) >> 8;
        const y = (instruction & 0x00f0) >> 4;
        const vxValue = ch8.getV(x);
        const vyValue = ch8.getV(y);
        const finalValue = vxValue ^ vyValue;
        ch8.setV(x, finalValue);
    }
    static add8xy4(instruction, ch8) {
        // Set Vx = Vx + Vy, set VF = carry.
        // The values of Vx and Vy are added together. If the result is greater
        // than 8 bits (i.e., > 255) VF is set to 1, otherwise 0. Only the lowest
        // 8 bits of the result are kept, and stored in Vx.
        const x = (instruction & 0x0f00) >> 8;
        const y = (instruction & 0x00f0) >> 4;
        const vxValue = ch8.getV(x);
        const vyValue = ch8.getV(y);
        const sum = vxValue + vyValue;
        if (sum > 0xff) {
            ch8.setV(x, sum & 0xff);
            ch8.setV(0xf, 1);
        }
        else {
            ch8.setV(x, sum);
            ch8.setV(0xf, 0);
        }
    }
    static sub8xy5(instruction, ch8) {
        // Set Vx = Vx - Vy, set VF = NOT borrow.
        // If Vx > Vy, then VF is set to 1, otherwise 0. Then Vy is subtracted from
        // Vx, and the results stored in Vx.
        const x = (instruction & 0x0f00) >> 8;
        const y = (instruction & 0x00f0) >> 4;
        const vxValue = ch8.getV(x);
        const vyValue = ch8.getV(y);
        ch8.setV(x, vxValue - vyValue);
        // The flag's test is passed only with '>='
        if (vxValue >= vyValue) {
            ch8.setV(0xf, 1);
        }
        else {
            ch8.setV(0xf, 0);
        }
    }
    static shr8xy6(instruction, ch8) {
        // Set Vx = Vx SHR 1
        // If the least-significant bit of Vx is 1, then VF is set to 1, otherwise
        // 0. Then Vx is divided by 2.
        const x = (instruction & 0x0f00) >> 8;
        // const y = (instruction & 0x00f0) >> 4;
        const vxValue = ch8.getV(x);
        // const vyValue = ch8.getV(y);
        const leastVxBit = vxValue & 0b1;
        ch8.setV(x, vxValue >> 1);
        ch8.setV(0xf, leastVxBit);
    }
    static subn8xy7(instruction, ch8) {
        // Set Vx = Vy - Vx, set VF = NOT borrow.
        // If Vy > Vx, then Vf is set to 1, otherwise 0. Then Vx is subtracted from
        // Vy, and the results stored in Vx.
        const x = (instruction & 0x0f00) >> 8;
        const y = (instruction & 0x00f0) >> 4;
        const vxValue = ch8.getV(x);
        const vyValue = ch8.getV(y);
        ch8.setV(x, vyValue - vxValue);
        // The flag's test is passed only with '>='
        if (vyValue >= vxValue) {
            ch8.setV(0xf, 1);
        }
        else {
            ch8.setV(0xf, 0);
        }
    }
    static shl8xyE(instruction, ch8) {
        // Set Vx = Vx SHL 1.
        // If the most-significant bit of Vx is 1, then VF is set to 1, otherwise
        // to 0. Then Vx is multiplied by 2.
        const x = (instruction & 0x0f00) >> 8;
        const vxValue = ch8.getV(x);
        ch8.setV(x, vxValue << 1);
        ch8.setV(0xf, (vxValue & 0b10000000) >> 7);
    }
    static sne9xy0(instruction, ch8) {
        // Skip next instruction if Vx != Vy.
        // The values of Vx and Vy are compared, and if they are not equal, the
        // program counter is increased by 2.
        const x = (instruction & 0x0f00) >> 8;
        const y = (instruction & 0x00f0) >> 4;
        const vxValue = ch8.getV(x);
        const vyValue = ch8.getV(y);
        if (!(vxValue === vyValue)) {
            ch8.pc += 2;
        }
    }
    static ldAnnn(instruction, ch8) {
        // Set I = nnn
        // The value of register I is set to nnn
        const address = instruction & 0x0fff;
        ch8.i = address;
    }
    static jpBnnn(instruction, ch8) {
        // Jump to location nnn + V0
        // The program counter is set to nnn plus the value of V0;
        const nnn = instruction & 0x0fff;
        ch8.pc = nnn + ch8.getV(0);
        ch8.skipAutoPc = true;
    }
    static rndCxkk(instruction, ch8) {
        // Set Vx = random byte and kk.
        // The interpreter generates a random number from 0 to 255,
        // which is then ANDed with the value kk. The results are
        // stored in Vx.
        const x = (instruction & 0x0f00) >> 8;
        const kk = instruction & 0x00ff;
        const MIN = 0;
        const MAX = 256;
        const randomByte = Math.floor(Math.random() * (MAX - MIN + 1)) + MIN;
        ch8.setV(x, kk & randomByte);
    }
    static drwDxyn(instruction, ch8) {
        // Display n-byte sprite starting at memory location I at (Vx, Vy),
        // set VF = collision.
        const x = (instruction & 0x0f00) >> 8;
        const y = (instruction & 0x00f0) >> 4;
        const n = instruction & 0x000f;
        // get Vx and Vy
        const colsCoord = ch8.getV(x);
        let rowsCoord = ch8.getV(y);
        // fill array with sprite's data
        let spriteArray = [];
        let memIndex = ch8.i;
        for (let j = 0; j < n; memIndex++, j++) {
            spriteArray.push(ch8.memory[memIndex]);
        }
        // VF
        ch8.setV(0xf, 0);
        let vFalreadyOn = false;
        // draw into display
        for (const byte of spriteArray) {
            let currentCol = colsCoord;
            let currentRow = rowsCoord;
            let bitOffset = 7;
            let mask = 128;
            for (let j = 8; j > 0; j--, bitOffset--, currentCol++, mask = mask >> 1) {
                // manage wrapping around the vertical axis
                if (currentRow >= 32) {
                    currentRow = 0;
                }
                let displayPixelOldValue = ch8.display[currentRow][currentCol];
                ch8.display[currentRow][currentCol] ^= (byte & mask) >> bitOffset;
                // first check VF is already set to 1. If not, check collision.
                if (vFalreadyOn === false) {
                    if (displayPixelOldValue === 1 &&
                        displayPixelOldValue !== ch8.display[currentRow][currentCol]) {
                        ch8.setV(0xf, 1);
                        vFalreadyOn = true;
                    }
                }
            }
            rowsCoord++; // next iteration of loop operate over next row on display
        }
        ch8.displayObject.diplayRun(ch8.display);
    }
    static skpEx9E(instruction, ch8) {
        // Skip next instruction if key with the value of Vx is pressed.
        // Checks the keyboard, and if the key corresponding to the value of Vx is
        // currently in he down position, Pc is increased by 2.
        const x = (instruction & 0x0f00) >> 8;
        const vxValue = ch8.getV(x);
        const keyDownObject = ch8.Keyboard.getKeyboardState();
        if (keyDownObject[vxValue.toString(16)] === true) {
            ch8.pc += 2;
        }
    }
    static sknpExA1(instruction, ch8) {
        // Skip next instruction if key with the value of Vx is not pressed.
        // Checks the keyboard, and if the key corresponding to the value of Vx is
        // currently in the up position, Pc is increased by 2.
        const x = (instruction & 0x0f00) >> 8;
        const vxValue = ch8.getV(x);
        const keyDownObject = ch8.Keyboard.getKeyboardState();
        if (keyDownObject[vxValue.toString(16)] === false) {
            ch8.pc += 2;
        }
    }
    static ldFx07(instruction, ch8) {
        // TODO: test
        // Set Vx = delay timer value.
        // The value of DT is placed into Vx.
        const x = (instruction & 0x0f00) >> 8;
        ch8.setV(x, ch8.delayTimer);
    }
    static ldFx0A(instruction, ch8) {
        // TODO: implement
        // Wait for a key press, store the value of the Key in Vx.
        // All execution stops until a key is pressed, then the value of that key
        // is stored in Vx.
        // ch8.Keyboard.insideFx0A = true;
        const x = (instruction & 0x0f00) >> 8;
        let keyName;
        let done = false;
        for (let key in ch8.Keyboard.keyboardDownState) {
            if (ch8.Keyboard.keyboardDownState[key] === true) {
                keyName = key;
                ch8.setV(x, parseInt(key, 16));
                done = true;
                ch8.Keyboard.insideFx0A = false;
                break;
            }
        }
        // for (let i = 0xf; i < 0; i--) {
        //   if (ch8.Keyboard.keyboardDownState[i.toString(16)] === true) {
        //     keyName = i.toString(16);
        //     ch8.setV(x, i);
        //     done = true;
        //     ch8.Keyboard.insideFx0A = false;
        //     break;
        //   }
        // }
        if (done === false) {
            ch8.skipAutoPc = true;
        }
        else {
            ch8.skipAutoPc = false;
            for (let key in ch8.Keyboard.keyboardDownState) {
                ch8.Keyboard.keyboardDownState[key] = false;
            }
        }
    }
    static ldFx15(instruction, ch8) {
        // TODO: test
        // Set delay timer = Vx.
        // DT is set equal to the value of Vx.
        const x = (instruction & 0x0f00) >> 8;
        const vxValue = ch8.getV(x);
        ch8.delayTimer = vxValue;
    }
    static ldFx18(instruction, ch8) {
        // TODO: test
        // Set sound timer = Vx.
        // ST is set equal to the value of Vx.
        const x = (instruction & 0x0f00) >> 8;
        const vxValue = ch8.getV(x);
        ch8.soundTimer = vxValue;
    }
    static addFx1E(instruction, ch8) {
        // Set I = I + Vx
        // The values of I and Vx are added, and the results are stored in I.
        const x = (instruction & 0x0f00) >> 8;
        const iValue = ch8.i;
        const vxValue = ch8.getV(x);
        ch8.i = iValue + vxValue;
    }
    static ldFx29(instruction, ch8) {
        // TODO: test
        // Set I = location of sprite for digit Vx.
        // The value of I is set to the location for the hexadecimal sprite
        // corresponding to the value of Vx.
        const initialLocation = 0x50;
        const x = (instruction & 0x0f00) >> 8;
        const vxValue = ch8.getV(x);
        ch8.i = initialLocation + 5 * vxValue;
    }
    static ldFx33(instruction, ch8) {
        // Store BCD representation of Vx in memory locations I, I+1, and I+2.
        // The interpreter takes the decimal value of Vx, and places the hundreds
        // digit in memory at location in I, the tens digit at location I+1, and
        // the one digit at location I+2.
        const x = (instruction & 0x0f00) >> 8;
        const vxValue = ch8.getV(x);
        let currentVxValue = vxValue;
        for (let j = 2; j >= 0; j--) {
            ch8.memory[ch8.i + j] = currentVxValue % 10;
            currentVxValue = Math.floor(currentVxValue / 10);
        }
    }
    static ldFx55(instruction, ch8) {
        // Store registers V0 through Vx in memory starting at location I.
        // The interpreter copies the values of registers V0 through Vx into
        // memory, starting at the address in I.
        const x = (instruction & 0x0f00) >> 8;
        let address = ch8.i;
        for (let i = 0; i <= x; i++) {
            ch8.memory[address++] = ch8.getV(i);
        }
    }
    static ldFx65(instruction, ch8) {
        // Read registers V0 through Vx from memory starting at location I.
        // The interpreter reads values from memory starting at location I
        // into registers V0 through Vx.
        const x = (instruction & 0x0f00) >> 8;
        let address = ch8.i;
        for (let i = 0; i <= x; i++) {
            ch8.setV(i, ch8.memory[address++]);
        }
    }
}
