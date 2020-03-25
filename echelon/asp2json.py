#!/usr/bin/env python3

import sys
import json
from collections import defaultdict

class Symbol:
    def __init__(self, clsname, symname):
       self.clsname = clsname
       self.symname = symname
       self.vars = {}
       self.props = defaultdict(list)
       self.bind = {}
       self.mins = {}
       self.maxs = {}
       self.enums = defaultdict(list)
       self.children = defaultdict(list)

    def const(self, visvar, val):
        self.vars[visvar] = val
    
    def prop(self, visvar, p):
        self.vars[visvar] = "bind"
        self.props[visvar].append(p)
        self.bind[(visvar, p)] = "bind"

    def min(self, visvar, p, val):
        #print ("Call min {} {} {}".format(visvar, p, val))
        #self.vars[visvar] = p
        self.mins[(visvar, p)] = val
        self.bind[(visvar, p)] = "bind_num"

    def max(self, visvar, p, val):
        #print ("Call max {} {} {}".format(visvar, p, val))
        #self.vars[visvar] = p
        self.maxs[(visvar, p)] = val
        self.bind[(visvar, p)] = "bind_num"

    def enum(self, visvar, p, val):
        #self.vars[visvar] = p
        self.enums[(visvar, p)].append(val)
        self.bind[(visvar, p)] = "bind_enum"

    def child(self, clsname_child, symname_child, reltype):
        self.children[reltype].append((clsname_child, symname_child))

    def get(self, visvar):
        if visvar in self.vars: 
            return self.vars[visvar]
        return "na"

    def get_props(self, visvar):
        return self.props[visvar]

    def get_bind(self, visvar, p):
        return self.bind[(visvar, p)]

    def get_min(self, visvar, p):
        #print ("request:")
        #print (visvar)
        #print ("vars")
        #print (self.vars)
        #print ("bind")
        #print (self.bind)
        #print ("enums")
        #print (self.mins)
        #print ("---")
        return self.mins[(visvar, p)]

    def get_max(self, visvar, p):
        return self.maxs[(visvar, p)]

    def get_enum(self, visvar, p):
        #print ("request:")
        #print (visvar)
        #print ("vars")
        #print (self.vars)
        #print ("bind")
        #print (self.bind)
        #print ("enums")
        #print (self.enums)
        #print ("---")
        return self.enums[(visvar, p)]

    def get_children(self, reltype):
        return self.children[reltype]
    
    def has_children(self):
        return len(self.children) > 0

class SymbolTable:
    def __init__(self):
        self.symnames = defaultdict(list) # could be multiple sym of same type
        self.clsnames = {} # at most 1 sym per data class

    def add(self, sym):
        self.symnames[sym.symname] = sym
        self.clsnames[sym.clsname] = sym
    
    def get_by_symname(self, sym_name):
        return self.symbols[sym_name]

    def get_by_clsname(self, cls_name):
        return self.clsnames[cls_name]
    
    def get(self, clsname, symname):
        result = self.get_by_clsname(clsname)
        assert result.clsname == clsname
        assert result.symname == symname
        return result
    
    def __iter__(self):
        return iter(self.clsnames.values())

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
    # workaround to get rid of '_val' and '_item' endings
    # args = [drop_suffix(x) for x in args]
    return fn, args

def symname(sym, sub_sym):
    # Form signle name from combination of sym class and sub_sym
    #return "{}_{}".format(sym, sub_sym)
    return (sym, sub_sym)

def loadsym(asp):
    """
    Reads symbol table model from ASP string.
    """
    table = SymbolTable()
        
    for (clsname, symname) in asp.get("sub_symbol", 2):
        #sym_name = symname(sym, sub_sym)
        sym = Symbol(clsname, symname)
        table.add(sym)
    
    for clsname, symname, visvar, val in asp.get("visual_const", 4):
        sym = table.get(clsname, symname)
        sym.const(visvar, val)
    
    for clsname, symname, visvar, p in asp.get("visual_prop", 4):
        sym = table.get(clsname, symname)
        sym.prop(visvar, p)

    for clsname, symname, visvar, p, i_min, o_min in asp.get("map_min", 6):
        sym = table.get(clsname, symname)
        sym.min(visvar, p, (i_min, o_min))

    for clsname, symname, visvar, p, i_min, o_min in asp.get("map_max", 6):
        sym = table.get(clsname, symname)
        sym.max(visvar, p, (i_min, o_min))

    for clsname, symname, visvar, p, i_val, o_val in asp.get("map_enum", 6):
        sym = table.get(clsname, symname)
        sym.enum(visvar, p, (i_val, o_val))

    for clsname_parent, symname_parent, symname_child, clsname_child, reltype in asp.get("relmap", 5):
        sym = table.get(clsname_parent, symname_parent)
        sym.child(clsname_child, symname_child, reltype)

    return table

VISVARS = "x;y;size;color;brightness;texture;orientation;shape"
visvars = VISVARS.split(";")
    
def renderJson(table):
    """
    Generates D3 vis
    """
    # gen json
    result = {} # similar to xsl:stylesheet
    for sym in table:
        res = {} # xsl:template

        if sym.has_children():
            if not "subsymbols" in res:
                res["subsymbols"] = {}
            for clsname_child, symname_child in sym.get_children("class"):
                if not symname_child in res["subsymbols"]:
                    res["subsymbols"][symname_child] = []
                res["subsymbols"][symname_child].append(clsname_child)
            for clsname_child, symname_child in sym.get_children("inst"):
                res["subsymbols"][symname_child] = clsname_child

        for visvar in visvars:
            # TODO: Use proprety names instead
            val = sym.get(visvar)
            if val == "bind":
                bindings = []
                for prop in sym.get_props(visvar):
                    binding = {}
                    bind = sym.get_bind(visvar, prop)
                    if bind == "bind":
                        # Unspecified bind type
                        binding = { "bind": prop };
                    if bind == "bind_num":
                        min_i, min_o = sym.get_min(visvar, prop)
                        max_i, max_o = sym.get_max(visvar, prop)
                        binding = {
                          "bind_num": prop,
                          "min_i": float(min_i),
                          "min_o": float(min_o),
                          "max_i": float(max_i),
                          "max_o": float(max_o)
                        };
                    if bind == "bind_enum":
                        binding = { "bind_enum": prop }
                        for pair in sym.get_enum(visvar, prop):
                            k, v = pair
                            binding[k] = v
                    bindings.append(binding)
                if (len(bindings) == 1):
                    res[visvar] = bindings[0]                
                else:
                    res[visvar] = { "bindings" : bindings }
            else:
                res[visvar] = val
        src_name, tgt_name = sym.clsname, sym.symname
        result[src_name] = res # xsl:template
        result[src_name]["symbol"] = tgt_name
    return json.dumps(result);

def drop_suffix(instr):
    if instr.endswith('_item') or instr.endswith('_val'):
        return '_'.join(instr.split('_')[:-1])
    return instr

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

    json_result = renderJson(table)
    print (json_result)

if __name__ == "__main__":
    main()