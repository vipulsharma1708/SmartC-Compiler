# PROJECT REPORT CONTENT

## Title
**SmartC Compiler Lab: Interactive Lexical Analyzer and LL(1) Predictive Parser for C-Lite**

## Abstract
SmartC Compiler Lab is an educational compiler front-end developed to demonstrate two important phases of compiler design: lexical analysis and syntax analysis. The system accepts a restricted C-like program, scans the source code into tokens using Lex-inspired rules, and then validates the token sequence using an LL(1)-style predictive parser. Unlike a traditional console-only lab program, the project provides a visual dashboard containing a source editor, token table, parser trace, grammar viewer and compiler console. This makes the internal working of a compiler easier to understand and present.

## Objectives
- To understand lexical analysis.
- To classify lexemes into meaningful tokens.
- To understand the role of a symbol/token stream between compiler phases.
- To demonstrate top-down LL(1) predictive parsing.
- To visualize parser decisions and stack/input progression.
- To provide instant syntax diagnostics.
- To build an attractive browser-based compiler lab tool.

## Modules
1. Source Code Editor
2. Lexical Analyzer
3. Token Stream Generator
4. LL(1) Parser
5. Parser Trace Visualizer
6. Grammar Viewer
7. Compiler Console
8. Error Diagnostic Module

## Lexical Analyzer
The scanner reads the input character by character. It identifies keywords, identifiers, numeric constants, operators, relational operators and delimiters. Comments and whitespace are ignored. Unknown symbols are reported as lexical errors.

## LL(1) Parser
The syntax analyzer checks whether the generated token sequence follows the selected C-Lite grammar. The parser follows a top-down predictive approach with one lookahead symbol. Expressions are handled through the standard separation of expression, term and factor levels, which avoids left recursion and is suitable for LL parsing.

## Grammar
Program → int main ( ) Block
Block → { StmtList }
StmtList → Stmt StmtList | ε
Stmt → Decl ; | Assign ; | IfStmt | Print ; | Return ;
Decl → int id Init
Init → = Expr | ε
Assign → id = Expr
IfStmt → if ( Cond ) Block
Print → print ( Expr )
Return → return Expr
Expr → Term Expr'
Expr' → + Term Expr' | - Term Expr' | ε
Term → Factor Term'
Term' → * Factor Term' | / Factor Term' | ε
Factor → id | num | ( Expr )
Cond → Expr RelOp Expr
RelOp → > | < | == | != | >= | <=

## Working
Source Code
↓
Lexical Analysis
↓
Token Stream
↓
LL(1) Predictive Parsing
↓
Syntax Decision
↓
Accepted / Error

## Advantages
- Easy to demonstrate in class.
- No compiler installation required for the web demo.
- Runs directly with VS Code Live Server.
- Makes compiler phases visually understandable.
- Includes both successful and error cases.
- Useful for viva preparation.

## Limitations
The project intentionally implements a C-Lite grammar. It is not intended to compile the complete C language or generate machine code. Its purpose is to demonstrate front-end compiler concepts.

## Future Scope
- Generate a parse tree.
- Add FIRST and FOLLOW set calculation.
- Add an interactive LL(1) parsing table.
- Add intermediate-code generation.
- Add symbol-table visualization.
- Add three-address code.
- Add C-to-C or C-to-JavaScript code generation for a larger subset.
