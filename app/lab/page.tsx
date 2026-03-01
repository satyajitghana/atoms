"use client";

import { useState, useMemo } from "react";
import dynamic from "next/dynamic";
import { ELEMENTS, CATEGORY_COLORS, type Element } from "@/lib/data/elements";
import { COMPOUNDS, type Compound } from "@/lib/data/compounds";
import { useLabStore, TOTAL_COMPOUNDS } from "@/lib/stores/lab-store";
import { EnergyMeter } from "@/components/lab/energy-meter";
import { ReactionAnimation } from "@/components/lab/reaction-animation";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import {
  Beaker,
  FlaskConical,
  Trash2,
  Sparkles,
  X,
  Trophy,
  ChevronDown,
  ChevronUp,
  Search,
} from "lucide-react";

const CompoundViewer = dynamic(
  () => import("@/components/three/compound-viewer").then((mod) => mod.CompoundViewer),
  { ssr: false }
);

// Common elements for quick access
const QUICK_ELEMENTS = [1, 6, 7, 8, 9, 11, 12, 13, 14, 15, 16, 17, 19, 20, 26, 29, 30, 35, 47, 56];

function ElementPalette({ onSelect }: { onSelect: (el: Element) => void }) {
  const [showAll, setShowAll] = useState(false);
  const [search, setSearch] = useState("");

  const quickElements = QUICK_ELEMENTS.map(
    (n) => ELEMENTS.find((e) => e.number === n)!
  );

  const filteredElements = useMemo(() => {
    if (!search) return ELEMENTS.slice(0, 36); // first 36
    const q = search.toLowerCase();
    return ELEMENTS.filter(
      (e) =>
        e.name.toLowerCase().includes(q) ||
        e.symbol.toLowerCase().includes(q) ||
        e.number.toString() === q
    );
  }, [search]);

  const displayElements = showAll ? filteredElements : quickElements;

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <h3 className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
          Elements
        </h3>
        <button
          onClick={() => setShowAll(!showAll)}
          className="text-[10px] text-primary hover:text-primary/80 flex items-center gap-0.5"
        >
          {showAll ? "Quick Access" : "Browse All"}
          {showAll ? (
            <ChevronUp className="h-3 w-3" />
          ) : (
            <ChevronDown className="h-3 w-3" />
          )}
        </button>
      </div>

      {showAll && (
        <div className="relative">
          <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-3 w-3 text-muted-foreground" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search elements..."
            className="w-full h-7 pl-7 pr-2 text-[11px] rounded-md border border-border/50 bg-muted/30 text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary/50"
          />
        </div>
      )}

      <div className="flex flex-wrap gap-1 max-h-[200px] overflow-y-auto">
        {displayElements.map((el) => {
          const color = CATEGORY_COLORS[el.category];
          return (
            <Tooltip key={el.number}>
              <TooltipTrigger asChild>
                <button
                  onClick={() => onSelect(el)}
                  className="h-8 w-8 rounded-md text-[10px] font-bold border transition-all hover:scale-110 cursor-pointer flex items-center justify-center"
                  style={{
                    background: `linear-gradient(135deg, ${color}18, ${color}35)`,
                    borderColor: `${color}50`,
                    color: color,
                  }}
                >
                  {el.symbol}
                </button>
              </TooltipTrigger>
              <TooltipContent side="top" className="text-xs">
                <p className="font-semibold">{el.name}</p>
                <p className="text-muted-foreground text-[10px]">
                  Click to add to workspace
                </p>
              </TooltipContent>
            </Tooltip>
          );
        })}
      </div>
    </div>
  );
}

function WorkspaceCard({
  element,
  index,
  onRemove,
}: {
  element: Element;
  index: number;
  onRemove: () => void;
}) {
  const color = CATEGORY_COLORS[element.category];
  return (
    <div
      className="relative group flex flex-col items-center justify-center w-16 h-20 rounded-lg border transition-all"
      style={{
        background: `linear-gradient(135deg, ${color}15, ${color}30)`,
        borderColor: `${color}40`,
      }}
    >
      <button
        onClick={onRemove}
        className="absolute -top-1.5 -right-1.5 h-4 w-4 rounded-full bg-destructive text-destructive-foreground flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
      >
        <X className="h-2.5 w-2.5" />
      </button>
      <span className="text-lg font-bold" style={{ color }}>
        {element.symbol}
      </span>
      <span className="text-[8px] text-muted-foreground truncate max-w-[56px]">
        {element.name}
      </span>
      <span className="text-[7px] font-mono text-muted-foreground/60">
        #{element.number}
      </span>
    </div>
  );
}

function ResultPanel({
  result,
  compound,
  onClose,
}: {
  result: ReturnType<typeof useLabStore.getState>["lastResult"];
  compound: Compound | null;
  onClose: () => void;
}) {
  if (!result) return null;

  return (
    <div
      className={cn(
        "p-4 rounded-lg border transition-all",
        result.success
          ? "bg-primary/5 border-primary/30"
          : "bg-destructive/5 border-destructive/30"
      )}
    >
      <div className="flex items-start justify-between mb-2">
        <div className="flex items-center gap-2">
          {result.success ? (
            <Sparkles className="h-4 w-4 text-primary" />
          ) : (
            <FlaskConical className="h-4 w-4 text-destructive" />
          )}
          <span
            className={cn(
              "text-sm font-semibold",
              result.success ? "text-primary" : "text-destructive"
            )}
          >
            {result.success ? "Compound Discovered!" : "No Reaction"}
          </span>
        </div>
        <button
          onClick={onClose}
          className="text-muted-foreground hover:text-foreground"
        >
          <X className="h-3.5 w-3.5" />
        </button>
      </div>

      <p className="text-xs text-muted-foreground mb-3">{result.message}</p>

      {compound && (
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <span className="text-lg font-mono font-bold text-foreground">
              {compound.formula}
            </span>
            <Badge variant="outline" className="text-[9px]">
              {compound.bondType}
            </Badge>
            <Badge variant="secondary" className="text-[9px]">
              Tier {compound.difficulty}
            </Badge>
          </div>
          <p className="text-[11px] text-muted-foreground">
            {compound.description}
          </p>
          {result.energy && (
            <EnergyMeter deltaHf={compound.deltaHf} />
          )}
          <CompoundViewer
            formula={compound.formula}
            className="w-full h-[250px] rounded-lg overflow-hidden border border-border/20"
          />
        </div>
      )}
    </div>
  );
}

function DiscoveryLog({
  discovered,
  total,
}: {
  discovered: string[];
  total: number;
}) {
  const [open, setOpen] = useState(false);

  const compoundsByDifficulty = useMemo(() => {
    const groups: Record<number, Compound[]> = { 1: [], 2: [], 3: [] };
    for (const c of COMPOUNDS) {
      groups[c.difficulty].push(c);
    }
    return groups;
  }, []);

  const tierLabels: Record<number, string> = {
    1: "Easy",
    2: "Medium",
    3: "Hard",
  };

  return (
    <div>
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between px-3 py-2 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors"
      >
        <div className="flex items-center gap-2">
          <Trophy className="h-3.5 w-3.5 text-yellow-500" />
          <span className="text-xs font-medium">Discovery Log</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-[10px] font-mono text-primary">
            {discovered.length}/{total}
          </span>
          {open ? (
            <ChevronUp className="h-3 w-3 text-muted-foreground" />
          ) : (
            <ChevronDown className="h-3 w-3 text-muted-foreground" />
          )}
        </div>
      </button>

      {open && (
        <div className="mt-2 space-y-3 max-h-[300px] overflow-y-auto">
          {[1, 2, 3].map((tier) => (
            <div key={tier}>
              <div className="flex items-center gap-2 mb-1.5">
                <h4 className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
                  {tierLabels[tier]}
                </h4>
                <span className="text-[9px] text-muted-foreground/60">
                  {
                    compoundsByDifficulty[tier].filter((c) =>
                      discovered.includes(c.formula)
                    ).length
                  }
                  /{compoundsByDifficulty[tier].length}
                </span>
              </div>
              <div className="flex flex-wrap gap-1">
                {compoundsByDifficulty[tier].map((c) => {
                  const found = discovered.includes(c.formula);
                  return (
                    <Tooltip key={c.formula}>
                      <TooltipTrigger asChild>
                        <div
                          className={cn(
                            "px-1.5 py-0.5 rounded text-[9px] font-mono border",
                            found
                              ? "bg-primary/10 border-primary/30 text-primary"
                              : "bg-muted/20 border-border/30 text-muted-foreground/40"
                          )}
                        >
                          {found ? c.formula : "???"}
                        </div>
                      </TooltipTrigger>
                      <TooltipContent side="top" className="text-xs">
                        {found ? (
                          <>
                            <p className="font-semibold">{c.name}</p>
                            <p className="text-muted-foreground text-[10px]">
                              {c.description}
                            </p>
                          </>
                        ) : (
                          <p className="text-muted-foreground">
                            Not yet discovered
                          </p>
                        )}
                      </TooltipContent>
                    </Tooltip>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Progress bar */}
      <div className="mt-2 h-1.5 rounded-full bg-muted/50 overflow-hidden">
        <div
          className="h-full rounded-full bg-gradient-to-r from-primary/80 to-primary transition-all duration-500"
          style={{ width: `${(discovered.length / total) * 100}%` }}
        />
      </div>
    </div>
  );
}

export default function LabPage() {
  const {
    workspace,
    discoveredCompounds,
    selectedCompound,
    lastResult,
    addElement,
    removeElement,
    clearWorkspace,
    react,
    clearResult,
  } = useLabStore();

  const [showAnimation, setShowAnimation] = useState(false);
  const [animationData, setAnimationData] = useState<{
    elements: string[];
    formula: string;
    name: string;
    exothermic: boolean;
    energyValue: number;
  } | null>(null);

  const handleReact = () => {
    const elements = workspace.map((el) => el.symbol);
    const result = react();
    if (result.success && result.compound) {
      setAnimationData({
        elements,
        formula: result.compound.formula,
        name: result.compound.name,
        exothermic: result.compound.deltaHf <= 0,
        energyValue: Math.abs(result.compound.deltaHf),
      });
      setShowAnimation(true);
    }
  };

  return (
    <div className="h-[calc(100vh-48px)] flex flex-col lg:flex-row overflow-hidden">
      {/* Left panel — Element Palette + Workspace */}
      <div className="lg:w-[400px] border-b lg:border-b-0 lg:border-r border-border/50 flex flex-col overflow-auto p-4 space-y-4">
        <div className="flex items-center gap-2">
          <Beaker className="h-4 w-4 text-primary" />
          <div>
            <h1 className="text-sm font-semibold">Compound Lab</h1>
            <p className="text-[10px] text-muted-foreground">
              Combine elements to discover compounds
            </p>
          </div>
        </div>

        <Separator className="opacity-30" />

        <ElementPalette onSelect={addElement} />

        <Separator className="opacity-30" />

        {/* Workspace */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <h3 className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
              Reaction Workspace
            </h3>
            {workspace.length > 0 && (
              <button
                onClick={clearWorkspace}
                className="text-[10px] text-destructive hover:text-destructive/80 flex items-center gap-0.5"
              >
                <Trash2 className="h-3 w-3" />
                Clear
              </button>
            )}
          </div>

          {workspace.length === 0 ? (
            <div className="flex items-center justify-center h-24 rounded-lg border border-dashed border-border/50 bg-muted/10">
              <p className="text-[10px] text-muted-foreground">
                Click elements above to add them here
              </p>
            </div>
          ) : (
            <div className="flex flex-wrap gap-2">
              {workspace.map((el, idx) => (
                <WorkspaceCard
                  key={`${el.number}-${idx}`}
                  element={el}
                  index={idx}
                  onRemove={() => removeElement(idx)}
                />
              ))}
            </div>
          )}

          <Button
            onClick={handleReact}
            disabled={workspace.length === 0}
            className="w-full h-9 text-xs font-medium"
          >
            <FlaskConical className="h-3.5 w-3.5 mr-1.5" />
            React! ({workspace.length} element{workspace.length !== 1 ? "s" : ""})
          </Button>
        </div>
      </div>

      {/* Right panel — Results + Discovery Log */}
      <div className="flex-1 flex flex-col overflow-auto p-4 space-y-4">
        {/* Result */}
        <ResultPanel
          result={lastResult}
          compound={selectedCompound}
          onClose={clearResult}
        />

        {/* Show selected compound details */}
        {!lastResult && selectedCompound && (
          <div className="p-4 rounded-lg border border-border/30 bg-card/30">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-lg font-mono font-bold text-foreground">
                {selectedCompound.formula}
              </span>
              <span className="text-sm text-muted-foreground">
                {selectedCompound.name}
              </span>
            </div>
            <p className="text-xs text-muted-foreground mb-3">
              {selectedCompound.description}
            </p>
            <div className="flex items-center gap-2 mb-3">
              <Badge variant="outline" className="text-[9px]">
                {selectedCompound.bondType}
              </Badge>
              <Badge variant="secondary" className="text-[9px]">
                Tier {selectedCompound.difficulty}
              </Badge>
            </div>
            <EnergyMeter deltaHf={selectedCompound.deltaHf} />
            <CompoundViewer
              formula={selectedCompound.formula}
              className="w-full h-[250px] mt-3 rounded-lg overflow-hidden border border-border/20"
            />
          </div>
        )}

        {/* Empty state */}
        {!lastResult && !selectedCompound && (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center space-y-2">
              <FlaskConical className="h-8 w-8 text-muted-foreground/30 mx-auto" />
              <p className="text-xs text-muted-foreground">
                Add elements and click React to discover compounds!
              </p>
              <p className="text-[10px] text-muted-foreground/60">
                Try combining Na + Cl, or H + H, or Fe + Fe + O + O + O
              </p>
            </div>
          </div>
        )}

        <div className="mt-auto">
          <Separator className="opacity-30 mb-4" />
          <DiscoveryLog
            discovered={discoveredCompounds}
            total={TOTAL_COMPOUNDS}
          />
        </div>
      </div>

      {/* Reaction animation overlay */}
      {showAnimation && animationData && (
        <ReactionAnimation
          elements={animationData.elements}
          formula={animationData.formula}
          name={animationData.name}
          exothermic={animationData.exothermic}
          energyValue={animationData.energyValue}
          onComplete={() => setShowAnimation(false)}
        />
      )}
    </div>
  );
}
