"""
ConceptClear AI - Multi-Subject Concept Dependency Graph & NetworkX Engine
Maps prerequisite relationships across Mathematics, Physics, and Computer Science.
Calculates concept lineages and isolates root-cause learning bottlenecks.
"""

from typing import Dict, List, Set, Any, Optional

try:
    import networkx as nx
except ImportError:
    nx = None

SUBJECTS_LIST = ["Mathematics", "Physics", "Computer Science"]

# Multi-Subject Concept Nodes Definition
CONCEPT_NODES = [
    # ==================== MATHEMATICS ====================
    {
        "slug": "basic-arithmetic",
        "name": "Basic Arithmetic",
        "subject": "Mathematics",
        "category": "Foundations",
        "difficulty": 1,
        "description": "Addition, subtraction, multiplication, and order of operations (PEMDAS).",
        "prerequisites": [],
        "order": 1,
        "x": 100, "y": 200
    },
    {
        "slug": "fractions",
        "name": "Fractions & Operations",
        "subject": "Mathematics",
        "category": "Number Systems",
        "difficulty": 2,
        "description": "Understanding numerators, denominators, finding common denominators, and fraction arithmetic.",
        "prerequisites": ["basic-arithmetic"],
        "order": 2,
        "x": 280, "y": 140
    },
    {
        "slug": "decimals",
        "name": "Decimals & Percentages",
        "subject": "Mathematics",
        "category": "Number Systems",
        "difficulty": 2,
        "description": "Decimal place values, rounding, conversions to fractions, and calculating percentages.",
        "prerequisites": ["basic-arithmetic"],
        "order": 3,
        "x": 280, "y": 280
    },
    {
        "slug": "ratios",
        "name": "Ratios & Proportions",
        "subject": "Mathematics",
        "category": "Comparative Math",
        "difficulty": 2,
        "description": "Part-to-part comparisons, unit rates, scaling, and direct proportions.",
        "prerequisites": ["fractions", "decimals"],
        "order": 4,
        "x": 460, "y": 280
    },
    {
        "slug": "basic-algebra",
        "name": "Basic Algebra",
        "subject": "Mathematics",
        "category": "Algebra",
        "difficulty": 2,
        "description": "Variables, expressions, combining like terms, and distributive property.",
        "prerequisites": ["basic-arithmetic", "fractions"],
        "order": 5,
        "x": 460, "y": 140
    },
    {
        "slug": "linear-equations",
        "name": "Linear Equations",
        "subject": "Mathematics",
        "category": "Algebra",
        "difficulty": 3,
        "description": "Solving single-variable equations, balancing both sides, and isolating variables.",
        "prerequisites": ["basic-algebra"],
        "order": 6,
        "x": 640, "y": 170
    },
    {
        "slug": "quadratic-equations",
        "name": "Quadratic Equations",
        "subject": "Mathematics",
        "category": "Advanced Algebra",
        "difficulty": 3,
        "description": "Second-degree polynomials, factoring, quadratic formula, and finding roots.",
        "prerequisites": ["linear-equations", "basic-algebra"],
        "order": 7,
        "x": 820, "y": 200
    },

    # ==================== PHYSICS ====================
    {
        "slug": "kinematics-motion",
        "name": "Kinematics & Motion",
        "subject": "Physics",
        "category": "Mechanics",
        "difficulty": 1,
        "description": "Displacement, velocity, speed, acceleration, and equations of 1D uniform motion.",
        "prerequisites": [],
        "order": 8,
        "x": 120, "y": 200
    },
    {
        "slug": "newtons-laws",
        "name": "Newton's Laws & Forces",
        "subject": "Physics",
        "category": "Mechanics",
        "difficulty": 2,
        "description": "Inertia, F = ma, action-reaction pairs, free body diagrams, and friction.",
        "prerequisites": ["kinematics-motion"],
        "order": 9,
        "x": 320, "y": 150
    },
    {
        "slug": "work-energy",
        "name": "Work, Energy & Power",
        "subject": "Physics",
        "category": "Energy Principles",
        "difficulty": 2,
        "description": "Mechanical work, kinetic vs potential energy, and conservation of energy.",
        "prerequisites": ["newtons-laws"],
        "order": 10,
        "x": 520, "y": 150
    },
    {
        "slug": "electric-circuits",
        "name": "Electric Circuits & Ohm's Law",
        "subject": "Physics",
        "category": "Electromagnetism",
        "difficulty": 2,
        "description": "Charge flow, potential difference (voltage), resistance, and series/parallel configurations.",
        "prerequisites": ["work-energy"],
        "order": 11,
        "x": 720, "y": 200
    },

    # ==================== COMPUTER SCIENCE ====================
    {
        "slug": "cs-variables",
        "name": "Variables & Data Types",
        "subject": "Computer Science",
        "category": "Programming Core",
        "difficulty": 1,
        "description": "Memory storage, primitive types (integers, strings, floats, booleans), and variable assignments.",
        "prerequisites": [],
        "order": 12,
        "x": 120, "y": 200
    },
    {
        "slug": "cs-conditionals",
        "name": "Conditionals & Logic",
        "subject": "Computer Science",
        "category": "Control Flow",
        "difficulty": 2,
        "description": "Boolean evaluation, if-elif-else branching, logical operators (AND, OR, NOT), and short-circuiting.",
        "prerequisites": ["cs-variables"],
        "order": 13,
        "x": 320, "y": 150
    },
    {
        "slug": "cs-loops",
        "name": "Loops & Iteration",
        "subject": "Computer Science",
        "category": "Control Flow",
        "difficulty": 2,
        "description": "Definite vs indefinite repetition, while loops, for loops, index boundaries, and termination.",
        "prerequisites": ["cs-conditionals"],
        "order": 14,
        "x": 520, "y": 150
    },
    {
        "slug": "cs-functions",
        "name": "Functions & Scope",
        "subject": "Computer Science",
        "category": "Modularity",
        "difficulty": 3,
        "description": "Parameters, arguments, return values, call stack, and variable scope rules.",
        "prerequisites": ["cs-loops", "cs-variables"],
        "order": 15,
        "x": 720, "y": 200
    }
]

class ConceptDependencyGraph:
    def __init__(self):
        self.nodes = {c["slug"]: c for c in CONCEPT_NODES}
        self.adj_list: Dict[str, List[str]] = {c["slug"]: [] for c in CONCEPT_NODES}
        self.downstream: Dict[str, List[str]] = {c["slug"]: [] for c in CONCEPT_NODES}

        for c in CONCEPT_NODES:
            for p in c["prerequisites"]:
                if p in self.nodes:
                    self.adj_list[c["slug"]].append(p)
                    self.downstream[p].append(c["slug"])

        if nx:
            self.G = nx.DiGraph()
            for c in CONCEPT_NODES:
                self.G.add_node(c["slug"], **c)
            for c in CONCEPT_NODES:
                for p in c["prerequisites"]:
                    self.G.add_edge(p, c["slug"])
        else:
            self.G = None

    def get_concepts_by_subject(self, subject: Optional[str] = None) -> List[Dict[str, Any]]:
        if not subject or subject.lower() == "all":
            return list(self.nodes.values())
        return [c for c in self.nodes.values() if c.get("subject", "").lower() == subject.lower()]

    def get_direct_prerequisites(self, concept_slug: str) -> List[str]:
        return self.adj_list.get(concept_slug, [])

    def get_all_ancestor_prerequisites(self, concept_slug: str) -> List[str]:
        visited: Set[str] = set()
        result: List[str] = []

        def dfs(curr: str):
            for p in self.adj_list.get(curr, []):
                if p not in visited:
                    visited.add(p)
                    dfs(p)
                    result.append(p)

        dfs(concept_slug)
        return result

    def get_downstream_dependents(self, concept_slug: str) -> List[str]:
        visited: Set[str] = set()
        result: List[str] = []

        def dfs(curr: str):
            for child in self.downstream.get(curr, []):
                if child not in visited:
                    visited.add(child)
                    result.append(child)
                    dfs(child)

        dfs(concept_slug)
        return result

    def find_root_cause_bottleneck(self, target_concept: str, mastery_map: Dict[str, float]) -> Optional[str]:
        ancestors = self.get_all_ancestor_prerequisites(target_concept)
        for anc in ancestors:
            score = mastery_map.get(anc, 0.0)
            if score < 0.60:
                return anc
        return None

    def get_topological_learning_path(self, subject: Optional[str] = None) -> List[str]:
        concepts = self.get_concepts_by_subject(subject)
        slug_set = {c["slug"] for c in concepts}
        if nx and self.G:
            try:
                full_topo = list(nx.topological_sort(self.G))
                return [s for s in full_topo if s in slug_set]
            except Exception:
                pass
        return [c["slug"] for c in sorted(concepts, key=lambda x: x["order"])]

    def export_graph_for_visualization(self, mastery_map: Optional[Dict[str, float]] = None, subject: Optional[str] = "Mathematics") -> Dict[str, Any]:
        """Exports formatted nodes and links filtered by chosen subject."""
        nodes_out = []
        links_out = []
        subject_concepts = self.get_concepts_by_subject(subject)
        slug_set = {c["slug"] for c in subject_concepts}

        for c in subject_concepts:
            slug = c["slug"]
            mastery = (mastery_map or {}).get(slug, 0.0)

            if slug not in (mastery_map or {}):
                status = "not_assessed"
                color = "#94A3B8"
            elif mastery >= 0.75:
                status = "mastered"
                color = "#16A34A"
            elif mastery >= 0.40:
                status = "needs_practice"
                color = "#F59E0B"
            else:
                status = "learning_gap"
                color = "#DC2626"

            nodes_out.append({
                "id": slug,
                "name": c["name"],
                "subject": c.get("subject", "Mathematics"),
                "category": c["category"],
                "difficulty": c["difficulty"],
                "description": c["description"],
                "prerequisites": c["prerequisites"],
                "mastery": round(mastery * 100, 1),
                "status": status,
                "color": color,
                "x": c["x"],
                "y": c["y"]
            })

            for p in c["prerequisites"]:
                if p in slug_set:
                    links_out.append({
                        "source": p,
                        "target": slug
                    })

        return {
            "subject": subject,
            "available_subjects": SUBJECTS_LIST,
            "nodes": nodes_out,
            "links": links_out
        }

concept_graph = ConceptDependencyGraph()
