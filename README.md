# SmartC Compiler Lab — Lex + LL(1) Parser

A visually attractive Compiler Design lab project that demonstrates a **C-like compiler front-end** in the browser.

## What makes it different?
Instead of showing only a console-based Lex/Yacc program, this project turns compiler phases into an interactive visual dashboard:

1. **Source Code Editor**
2. **Lex-inspired Lexical Analyzer**
3. **Token Stream Table**
4. **LL(1) Predictive Parser**
5. **Parser Stack / Trace**
6. **Compiler Console**
7. **Grammar Panel**
8. **Compiler Insights**

## Technologies
- HTML5
- CSS3
- JavaScript
- No backend
- No npm installation
- Runs using VS Code Live Server

## How to run
1. Extract the ZIP.
2. Open the `SmartC_Compiler_Lab` folder in VS Code.
3. Install the **Live Server** extension if it is not already installed.
4. Right-click `index.html`.
5. Select **Open with Live Server**.
6. The project opens in the browser.

## Supported C-Lite syntax
The demo grammar supports:
- `int`, `float`, `char`
- `main()`
- variable declarations
- assignments
- arithmetic expressions
- `if` blocks
- `print(expression);`
- `return expression;`
- relational operators: `> < == != >= <=`
- comments

Example:
```c
int main() {
    int a = 10;
    int b = 20;
    int sum = a + b;

    if (sum > 20) {
        print(sum);
    }

    return 0;
}
```

## Lab viva explanation
**LEX phase:** converts source characters into tokens such as KEYWORD, ID, NUM, OP and DELIMITER.

**LL(1) phase:** uses a top-down predictive parsing approach. The first `L` means input is read left-to-right, the second `L` means a leftmost derivation is used, and `1` means one lookahead token is used to choose a production.

**Important note:** This is an educational C-Lite compiler front-end. It demonstrates the concepts of Lexical Analysis and LL(1) Parsing rather than compiling arbitrary full C language into machine code.

## Suggested project title
**SmartC Compiler Lab: Interactive Lexical Analyzer and LL(1) Predictive Parser for C-Lite**

## Presentation flow
1. Show the source code.
2. Click Compile & Visualize.
3. Explain token generation.
4. Move to parser stack trace.
5. Show ACCEPT result.
6. Change `sum > 20` to `sum >` and compile again.
7. Demonstrate the syntax error.
8. Explain the grammar panel and why LL(1) is used.
