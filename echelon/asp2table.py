#!/usr/bin/env python3

import sys
import json
from collections import defaultdict

class Symbol:
    def __init__(self, name):
       self.name = name
       self.vars = {}
       self.bind = {}
    
    def const(self, visvar, val):
        self.vars[visvar] = val
        self.bind[visvar] = False
    
    def prop(self, visvar, p):
        self.vars[visvar] = p
        self.bind[visvar] = True
    
    def get(self, visvar):
        if visvar in self.vars: 
            return self.vars[visvar]
        return "na"

    def get_bind(self, visvar):
        if visvar in self.vars:
            return self.bind[visvar]
        return None


class SymbolTable:
    def __init__(self):
        self.symbols = {}
    
    def add(self, sym):
        self.symbols[sym.name] = sym
    
    def get(self, sym_name):
        return self.symbols[sym_name]
    
    def __iter__(self):
        return iter(self.symbols.values())

class Asp:
    def __init__(self, asp_statements):
        # fn_name, parity -> values
        self.fn_idx = defaultdict(list)
        
        for asp_statement in asp_statements:
            fn_name, args = parse(asp_statement)
            parity = len(args)
            self.fn_idx[(fn_name, parity)].append(args)

    def get(self, fn_name, parity):
        args = self.fn_idx[(fn_name, parity)]
        return args

def parse(asp_line):
    fn = ""
    fn, tail = asp_line.split("(")
    tail = tail[:-1] # drop trailing ")"
    args = tail.split(",")
    return fn, args

def symname(sym, sub_sym):
    # Form signle name from combination of sym class and sub_sym
    return "{}→{}".format(sym, sub_sym)

def loadsym(asp):
    """
    Reads symbol table model from ASP string.
    """
    table = SymbolTable()
        
    for (sym, sub_sym) in asp.get("sub_symbol", 2):
        sym_name = symname(sym, sub_sym)
        sym = Symbol(sym_name)
        table.add(sym)
    
    for sym, sub_sym, visvar, val in asp.get("visual_const", 4):
        sym_name = symname(sym, sub_sym)
        sym = table.get(sym_name)
        sym.const(visvar, val)
    
    for sym, sub_sym, visvar, p in asp.get("visual_prop", 4):
        sym_name = symname(sym, sub_sym)
        sym = table.get(sym_name)
        sym.prop(visvar, p)
    
    return table

VISVARS = "x;y;size;color;brightness;texture;orientation;shape"
visvars = VISVARS.split(";")

def renderTable(table):
    """
    Renders HTML table from symbol table
    """
    res = """
<table>
  <thead>
    <tr>
      <th></th>"""
    for visvar in visvars:
        res += "<th>{}</th>".format(visvar)
    res += """
    </tr>
  </thead>
  <tbody>"""
    for sym in table:
        res += """
  <tr>"""
        res += "<th>{}</th>".format(sym.name)
        for visvar in visvars:
            var = sym.get(visvar)
            bind = sym.get_bind(visvar)
            if bind:
                res += "<td><em>{}</em></td>".format(sym.get(visvar))
            else:
                res += "<td>{}</td>".format(sym.get(visvar))
        res += "<td><div id='{}' style='width:50px;height:50px' /></td>".format(sym.name)
        res += """
  </tr>"""

    res += """
</tbody>
</table>
"""
    return res
    
def renderJson(table):
    """
    Generates D3 vis
    """
    # gen json
    result = {};
    for sym in table:
        res = {};
        for visvar in visvars:
            res[visvar] = sym.get(visvar);
            bind = sym.get_bind(visvar);
            if bind:
                res[visvar] = { "bind": sym.get(visvar) };
            else:
                res[visvar] = sym.get(visvar);
        result[sym.name] = res;

    return json.dumps(result);

def main():
    # Usage ./asp2table.py soln.lp.json > soln_table.html
    try:
        inputfile = sys.argv[1]
    except IndexError:
        sys.exit("Missing argument: inputfile")
    
    with open(inputfile) as f:
        aspjson = json.load(f)
    
    assert aspjson["Result"] in ["OPTIMUM FOUND", "SATISFIABLE"] 
    # Take the last solution value
    asp_statements = aspjson["Call"][-1]["Witnesses"][-1]["Value"]

    asp = Asp(asp_statements)
    table = loadsym(asp)

    html = """
<!DOCTYPE html>
<html>
<title>Notation</title>
<style type="text/css">
table {
  border-collapse: collapse;
}
th {
  padding:1em;
  text-align:left;
}
td {
  border-top:1px solid black;
  border-bottom:1px solid black;
  padding:1em;
  width:50px;
}
</style>
<script>
"""
    html += "data = " + renderJson(table) + ";\n"
    # html += "instData = " + open("data.json").read().strip() + ";" # TODO: Pass in
    # <script src="vis.js"></script>
    html += open("vis.js").read() # embed (to prevent need to also copy library)
    html += """
</script>
"""
    html += renderTable(table)
    # https://developer.mozilla.org/en-US/docs/Web/SVG/Attribute/maskContentUnits
    # Use userSpaceOnUse rather than objectBoundingBox because we don't
    # want texture to scale
    html += """
<svg id="chart" width="800" height="600" style="display:none; border:solid black 2px; margin:2em;"></svg>
<svg id="pats" width="100" height="100">
  <defs>
    <pattern id="linebg1pat" viewBox="0,0,100,100" width="0.03" height="0.03">
      <line x1="50" x2="50" y1="0" y2="100" stroke="white" stroke-width="50%"/>
    </pattern>
    <pattern id="linebg2pat" viewBox="0,0,100,100" width="0.06" height="0.06">
      <line x1="50" x2="50" y1="0" y2="100" stroke="white" stroke-width="50%"/>
    </pattern>
    <pattern id="linebg3pat" viewBox="0,0,100,100" width="0.09" height="0.09">
      <line x1="50" x2="50" y1="0" y2="100" stroke="white" stroke-width="50%"/>
    </pattern>
    <pattern id="linebg4pat" viewBox="0,0,100,100" width="0.12" height="0.12">
      <line x1="50" x2="50" y1="0" y2="100" stroke="white" stroke-width="50%"/>
    </pattern>
    <pattern id="linebg5pat" viewBox="0,0,100,100" width="0.15" height="0.15">
      <line x1="50" x2="50" y1="0" y2="100" stroke="white" stroke-width="50%"/>
    </pattern>
     <mask id="linebg1" maskContentUnits="userSpaceOnUse">
       <rect x="0" y="0" width="100%" height="100%" fill="black" />  
       <rect x="0" y="0" width="100%" height="100%" fill="url(#linebg1pat)" />  
     </mask>
     <mask id="linebg2" maskContentUnits="userSpaceOnUse">
       <rect x="0" y="0" width="100%" height="100%" fill="black" />  
       <rect x="0" y="0" width="100%" height="100%" fill="url(#linebg2pat)" />  
     </mask>
     <mask id="linebg3" maskContentUnits="userSpaceOnUse">
       <rect x="0" y="0" width="100%" height="100%" fill="black" />  
       <rect x="0" y="0" width="100%" height="100%" fill="url(#linebg3pat)" />  
     </mask>
     <mask id="linebg4" maskContentUnits="userSpaceOnUse">
       <rect x="0" y="0" width="100%" height="100%" fill="black" />  
       <rect x="0" y="0" width="100%" height="100%" fill="url(#linebg4pat)" />  
     </mask>
     <mask id="linebg5" maskContentUnits="userSpaceOnUse">
       <rect x="0" y="0" width="100%" height="100%" fill="black" />  
       <rect x="0" y="0" width="100%" height="100%" fill="url(#linebg5pat)" />  
     </mask>
  </defs>
</svg>
"""
    html += """
</body>
</html>
"""
    print (html)

if __name__ == "__main__":
    main()