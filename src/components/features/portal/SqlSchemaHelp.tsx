"use client";

import React, { useState } from "react";
import { useTranslations } from "next-intl";
import {
  Table2,
  Database,
  Search,
  Key,
  Link2,
  Code,
  Copy,
  Check,
  ChevronDown,
  ChevronRight,
  BookOpen,
  Sparkles,
  Layers,
  ArrowRight,
  Info,
  ShieldCheck
} from "lucide-react";
import { toast } from "sonner";
import {
  SCHEMA_TABLES,
  SQL_QUERY_TEMPLATES,
  type SchemaTable,
  type SchemaColumn,
  type SqlTemplate
} from "./sqlSchemaData";

interface SqlSchemaHelpProps {
  onInsertSnippet: (text: string) => void;
  onSetQuery: (sql: string) => void;
}

export const SqlSchemaHelp: React.FC<SqlSchemaHelpProps> = ({
  onInsertSnippet,
  onSetQuery,
}) => {
  const t = useTranslations("SqlSchemaHelp");
  const [activeTab, setActiveTab] = useState<"tablas" | "plantillas" | "guia">("tablas");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("Todas");
  const [expandedTables, setExpandedTables] = useState<Record<string, boolean>>({
    'public."Producto"': true,
    'public."Reservacion"': true,
    'public."DetalleReservacion"': true,
  });
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const categories = [
    "Todas",
    "Catálogo & Stock",
    "Ventas & Pedidos",
    "Usuarios & Sucursales",
    "Configuración & Reportes",
  ];

  const toggleTable = (tableName: string) => {
    setExpandedTables((prev) => ({
      ...prev,
      [tableName]: !prev[tableName],
    }));
  };

  const expandAll = () => {
    const allExpanded: Record<string, boolean> = {};
    SCHEMA_TABLES.forEach((t) => {
      allExpanded[t.table] = true;
    });
    setExpandedTables(allExpanded);
  };

  const collapseAll = () => {
    setExpandedTables({});
  };

  const handleCopy = (text: string, id: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    toast.success(t("toast_template_copied", { label }));
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleApplyTemplate = (template: SqlTemplate) => {
    onSetQuery(template.sql);
    toast.success(t("toast_template_loaded", { title: template.title }));
  };

  // Filter tables
  const filteredTables = SCHEMA_TABLES.filter((t) => {
    const matchesCategory =
      selectedCategory === "Todas" || t.category === selectedCategory;

    if (!searchQuery.trim()) return matchesCategory;

    const q = searchQuery.toLowerCase();
    const matchesTableName =
      t.table.toLowerCase().includes(q) || t.label.toLowerCase().includes(q);
    const matchesTableDetail = t.detail.toLowerCase().includes(q);
    const matchesColumns = t.columns.some(
      (c) =>
        c.name.toLowerCase().includes(q) ||
        c.description.toLowerCase().includes(q) ||
        c.type.toLowerCase().includes(q)
    );

    return matchesCategory && (matchesTableName || matchesTableDetail || matchesColumns);
  });

  return (
    <div className="rounded-xl border border-slate-900 bg-slate-955 overflow-hidden shadow-lg">
      {/* Header with Navigation Tabs */}
      <div className="border-b border-slate-900 bg-slate-950/90 px-4 py-3 sm:px-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#22D3A6]/10 text-[#22D3A6] border border-[#22D3A6]/20">
            <Database size={16} />
          </div>
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-white flex items-center gap-2">
              <span>{t("header_title")}</span>
              <span className="rounded-md bg-sky-500/10 px-2 py-0.5 text-[9px] font-bold text-sky-400 border border-sky-500/20 lowercase font-mono">
                PostgreSQL
              </span>
            </h3>
            <p className="text-[11px] text-slate-400">
              {t("header_subtitle")}
            </p>
          </div>
        </div>

        {/* Tab Buttons */}
        <div className="inline-flex rounded-lg bg-slate-900 p-1 border border-slate-800/80">
          <button
            type="button"
            onClick={() => setActiveTab("tablas")}
            className={`flex items-center gap-1.5 rounded-md px-3 py-1 text-xs font-bold transition-all cursor-pointer border-none ${
              activeTab === "tablas"
                ? "bg-[#22D3A6] text-slate-950 shadow-sm"
                : "bg-transparent text-slate-400 hover:text-white"
            }`}
          >
            <Table2 size={13} />
            <span>{t("tab_tables", { count: SCHEMA_TABLES.length })}</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("plantillas")}
            className={`flex items-center gap-1.5 rounded-md px-3 py-1 text-xs font-bold transition-all cursor-pointer border-none ${
              activeTab === "plantillas"
                ? "bg-[#22D3A6] text-slate-950 shadow-sm"
                : "bg-transparent text-slate-400 hover:text-white"
            }`}
          >
            <Sparkles size={13} />
            <span>{t("tab_templates", { count: SQL_QUERY_TEMPLATES.length })}</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("guia")}
            className={`flex items-center gap-1.5 rounded-md px-3 py-1 text-xs font-bold transition-all cursor-pointer border-none ${
              activeTab === "guia"
                ? "bg-[#22D3A6] text-slate-950 shadow-sm"
                : "bg-transparent text-slate-400 hover:text-white"
            }`}
          >
            <ShieldCheck size={13} />
            <span>{t("tab_rules")}</span>
          </button>
        </div>
      </div>

      {/* TAB 1: TABLAS Y ATRIBUTOS */}
      {activeTab === "tablas" && (
        <div className="p-4 sm:p-5 space-y-4">
          {/* Controls: Search and Categories */}
          <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
            {/* Search input */}
            <div className="relative flex-1 max-w-md">
              <Search
                size={14}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500"
              />
              <input
                type="text"
                placeholder={t("search_placeholder")}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full rounded-xl bg-slate-900/90 pl-9 pr-3 py-1.5 text-xs text-slate-200 placeholder:text-slate-500 border border-slate-800 focus:border-[#22D3A6] focus:outline-none transition-colors font-mono"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery("")}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[10px] text-slate-500 hover:text-slate-300 cursor-pointer bg-transparent border-none"
                >
                  ✕
                </button>
              )}
            </div>

            {/* Category selection */}
            <div className="flex flex-wrap items-center gap-1.5">
              {categories.map((cat) => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setSelectedCategory(cat)}
                  className={`rounded-lg px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider transition-all border cursor-pointer ${
                    selectedCategory === cat
                      ? "bg-[#22D3A6]/15 text-[#22D3A6] border-[#22D3A6]/40"
                      : "bg-slate-900/60 text-slate-400 border-slate-800 hover:text-slate-200"
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>

            {/* Expand / Collapse All */}
            <div className="flex items-center gap-2 self-end lg:self-auto text-[11px] text-slate-400">
              <button
                type="button"
                onClick={expandAll}
                className="hover:text-[#22D3A6] transition-colors cursor-pointer bg-transparent border-none"
              >
                {t("expand_all")}
              </button>
              <span>•</span>
              <button
                type="button"
                onClick={collapseAll}
                className="hover:text-[#22D3A6] transition-colors cursor-pointer bg-transparent border-none"
              >
                {t("collapse_all")}
              </button>
            </div>
          </div>

          {/* Table Cards List */}
          <div className="space-y-3">
            {filteredTables.length === 0 ? (
              <div className="rounded-xl border border-slate-900 bg-slate-950/40 p-8 text-center text-xs text-slate-500 font-mono">
                {t("no_tables_found", { query: searchQuery })}
              </div>
            ) : (
              filteredTables.map((tbl) => {
                const isExpanded = !!expandedTables[tbl.table];
                return (
                  <div
                    key={tbl.table}
                    className="rounded-xl border border-slate-900 bg-slate-950/40 hover:border-slate-800/80 transition-all overflow-hidden"
                  >
                    {/* Table Header / Accordion trigger */}
                    <div
                      onClick={() => toggleTable(tbl.table)}
                      className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3.5 sm:px-4 cursor-pointer hover:bg-slate-900/30 transition-colors select-none"
                    >
                      <div className="flex items-center gap-2.5">
                        <span className="text-slate-500">
                          {isExpanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
                        </span>
                        <code className="text-xs font-bold text-[#22D3A6] font-mono tracking-wide bg-[#22D3A6]/10 px-2 py-0.5 rounded border border-[#22D3A6]/20">
                          {tbl.table}
                        </code>
                        <span className="text-[11px] text-slate-300 font-medium">
                          {tbl.detail}
                        </span>
                      </div>

                      <div
                        className="flex items-center gap-2 pl-6 sm:pl-0"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <span className="text-[10px] text-slate-500 font-mono uppercase bg-slate-900 px-2 py-0.5 rounded border border-slate-800">
                          {t("columns_count", { count: tbl.columns.length })}
                        </span>

                        {/* Quick Insert Table Snippet */}
                        <button
                          type="button"
                          onClick={() => {
                            onInsertSnippet(` ${tbl.table} `);
                            toast.success(t("toast_table_inserted"));
                          }}
                          className="px-2 py-1 text-[10px] font-bold font-mono rounded bg-slate-800 text-slate-300 hover:bg-[#22D3A6]/20 hover:text-[#22D3A6] border border-slate-700 transition-all cursor-pointer flex items-center gap-1"
                          title={t("insert_tooltip")}
                        >
                          <Code size={11} />
                          {t("insert_button")}
                        </button>

                        {/* Quick Insert SELECT Query */}
                        <button
                          type="button"
                          onClick={() => {
                            const hasTiendaId = tbl.columns.some((c) => c.name === "tienda_id");
                            const filterClause = hasTiendaId
                              ? "WHERE tienda_id = @tenant_id"
                              : tbl.table.includes("Tienda")
                              ? "WHERE id = @tenant_id"
                              : "";
                            const sql = `SELECT * FROM ${tbl.table} ${filterClause} LIMIT 20;`;
                            onSetQuery(sql);
                            toast.success(t("toast_select_loaded", { label: tbl.label }));
                          }}
                          className="px-2 py-1 text-[10px] font-bold font-mono rounded bg-sky-500/10 text-sky-400 hover:bg-sky-500/20 border border-sky-500/30 transition-all cursor-pointer flex items-center gap-1"
                          title={t("select_query_tooltip")}
                        >
                          <ArrowRight size={11} />
                          SELECT *
                        </button>
                      </div>
                    </div>

                    {/* Table Columns List (Accordion Body) */}
                    {isExpanded && (
                      <div className="border-t border-slate-900 bg-slate-955/60 p-3 sm:p-4 space-y-3 animate-fade-in">
                        <p className="text-xs text-slate-400 leading-relaxed">
                          {tbl.description}
                        </p>

                        <div className="overflow-x-auto rounded-lg border border-slate-900 bg-slate-950">
                          <table className="w-full text-left text-xs border-collapse font-mono">
                            <thead>
                              <tr className="border-b border-slate-900 bg-slate-900/60 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                                <th className="px-3.5 py-2">{t("table_column")}</th>
                                <th className="px-3.5 py-2">{t("table_data_type")}</th>
                                <th className="px-3.5 py-2">{t("table_constraints")}</th>
                                <th className="px-3.5 py-2">{t("table_description")}</th>
                                <th className="px-3.5 py-2 text-right">{t("table_action")}</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-900/60">
                              {tbl.columns.map((col) => {
                                const isQueryMatch =
                                  searchQuery &&
                                  (col.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                                    col.description.toLowerCase().includes(searchQuery.toLowerCase()));

                                return (
                                  <tr
                                    key={col.name}
                                    className={`hover:bg-slate-900/40 transition-colors ${
                                      isQueryMatch ? "bg-[#22D3A6]/5" : ""
                                    }`}
                                  >
                                    {/* Column Name */}
                                    <td className="px-3.5 py-2 font-bold text-slate-200 whitespace-nowrap">
                                      <div className="flex items-center gap-1.5">
                                        <span>{col.name}</span>
                                        {col.isPk && (
                                          <span
                                            className="inline-flex items-center gap-0.5 rounded bg-amber-500/15 px-1.5 py-0.2 text-[9px] font-bold text-amber-400 border border-amber-500/30"
                                            title={t("pk_tooltip")}
                                          >
                                            <Key size={9} /> PK
                                          </span>
                                        )}
                                        {col.isFk && (
                                          <span
                                            className="inline-flex items-center gap-0.5 rounded bg-sky-500/15 px-1.5 py-0.2 text-[9px] font-bold text-sky-400 border border-sky-500/30"
                                            title={t("fk_tooltip", { ref: col.fkRef ?? "" })}
                                          >
                                            <Link2 size={9} /> FK
                                          </span>
                                        )}
                                      </div>
                                    </td>

                                    {/* Data Type */}
                                    <td className="px-3.5 py-2 whitespace-nowrap">
                                      <span className="text-[11px] text-sky-400 bg-sky-950/40 px-1.5 py-0.5 rounded border border-sky-900/40">
                                        {col.type}
                                      </span>
                                    </td>

                                    {/* Constraints / Nullable */}
                                    <td className="px-3.5 py-2 whitespace-nowrap text-[10px]">
                                      {col.isNullable ? (
                                        <span className="text-slate-500">NULL</span>
                                      ) : (
                                        <span className="text-emerald-400/90 font-semibold">NOT NULL</span>
                                      )}
                                      {col.defaultValue && (
                                        <span className="text-slate-500 ml-1">
                                          ({col.defaultValue})
                                        </span>
                                      )}
                                    </td>

                                    {/* Description */}
                                    <td className="px-3.5 py-2 text-slate-400 font-sans text-xs">
                                      {col.description}
                                      {col.fkRef && (
                                        <span className="block text-[10px] text-slate-500 font-mono mt-0.5">
                                          {t("ref_label", { ref: col.fkRef })}
                                        </span>
                                      )}
                                    </td>

                                    {/* Quick Insert Column */}
                                    <td className="px-3.5 py-2 text-right whitespace-nowrap">
                                      <button
                                        type="button"
                                        onClick={() => {
                                          onInsertSnippet(col.name);
                                          toast.success(t("toast_column_inserted", { name: col.name }));
                                        }}
                                        className="px-2 py-0.5 text-[10px] font-bold rounded bg-slate-800 text-slate-300 hover:bg-[#22D3A6] hover:text-slate-950 transition-all border border-slate-700 cursor-pointer"
                                        title={t("add_column_tooltip", { name: col.name })}
                                      >
                                        {t("add_column_button")}
                                      </button>
                                    </td>
                                  </tr>
                                );
                              })}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}

      {/* TAB 2: PLANTILLAS SQL */}
      {activeTab === "plantillas" && (
        <div className="p-4 sm:p-5 space-y-4">
          <p className="text-xs text-slate-400">
            {t("templates_intro")}
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {SQL_QUERY_TEMPLATES.map((tmpl) => (
              <div
                key={tmpl.id}
                className="rounded-xl border border-slate-900 bg-slate-950/60 p-4.5 flex flex-col justify-between gap-3 hover:border-slate-800 transition-all"
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between gap-2">
                    <h4 className="text-xs font-bold text-white flex items-center gap-1.5">
                      <Sparkles size={13} className="text-[#22D3A6]" />
                      <span>{tmpl.title}</span>
                    </h4>
                    <span className="rounded bg-slate-900 border border-slate-800 px-2 py-0.5 text-[9px] font-bold text-slate-400 uppercase tracking-wider font-mono">
                      {tmpl.category}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-400 leading-relaxed">
                    {tmpl.description}
                  </p>

                  <div className="relative group rounded-lg bg-[#09111c] border border-slate-800/80 p-2.5 overflow-hidden">
                    <pre className="text-[11px] font-mono text-slate-300 overflow-x-auto max-h-36 whitespace-pre">
                      {tmpl.sql}
                    </pre>
                  </div>
                </div>

                <div className="flex items-center justify-between gap-2 pt-1 border-t border-slate-900">
                  <button
                    type="button"
                    onClick={() => handleCopy(tmpl.sql, tmpl.id, t("template_sql_label"))}
                    className="px-2.5 py-1 text-[11px] font-mono font-semibold text-slate-400 hover:text-white bg-slate-900 hover:bg-slate-800 rounded-lg border border-slate-800 transition-all flex items-center gap-1 cursor-pointer"
                  >
                    {copiedId === tmpl.id ? (
                      <>
                        <Check size={12} className="text-[#22D3A6]" />
                        <span className="text-[#22D3A6]">{t("copied_label")}</span>
                      </>
                    ) : (
                      <>
                        <Copy size={12} />
                        <span>{t("copy_template_button")}</span>
                      </>
                    )}
                  </button>

                  <button
                    type="button"
                    onClick={() => handleApplyTemplate(tmpl)}
                    className="px-3 py-1 text-[11px] font-bold bg-[#22D3A6] hover:bg-[#1ebda1] text-slate-950 rounded-lg transition-all flex items-center gap-1 cursor-pointer border-none shadow-sm"
                  >
                    <Code size={12} />
                    <span>{t("load_in_editor_button")}</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 3: REGLAS Y SEGURIDAD */}
      {activeTab === "guia" && (
        <div className="p-4 sm:p-5 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Box 1: Tenant ID Isolation */}
            <div className="rounded-xl border border-slate-900 bg-slate-950/40 p-4 space-y-2.5">
              <div className="flex items-center gap-2 text-[#22D3A6] font-bold text-xs">
                <ShieldCheck size={16} />
                <span>{t("box1_title")}</span>
              </div>
              <p className="text-xs text-slate-400 leading-relaxed">
                {t("box1_p1")}
              </p>
              <code className="block rounded bg-[#09111c] border border-slate-800 p-2 text-xs font-mono text-[#22D3A6]">
                WHERE tienda_id = @tenant_id
              </code>
              <p className="text-[11px] text-slate-500">
                {t("box1_p2")}
              </p>
            </div>

            {/* Box 2: Table Quoting */}
            <div className="rounded-xl border border-slate-900 bg-slate-950/40 p-4 space-y-2.5">
              <div className="flex items-center gap-2 text-sky-400 font-bold text-xs">
                <Code size={16} />
                <span>{t("box2_title")}</span>
              </div>
              <p className="text-xs text-slate-400 leading-relaxed">
                {t("box2_p1")} <code className="text-sky-300 font-mono">user</code>.
              </p>
              <code className="block rounded bg-[#09111c] border border-slate-800 p-2 text-xs font-mono text-sky-300">
                public.&quot;Producto&quot;<br />
                public.&quot;Reservacion&quot;<br />
                public.&quot;user&quot;
              </code>
              <p className="text-[11px] text-slate-500">
                {t("box2_p2")}
              </p>
            </div>

            {/* Box 3: Read-Only Mode */}
            <div className="rounded-xl border border-slate-900 bg-slate-950/40 p-4 space-y-2.5">
              <div className="flex items-center gap-2 text-amber-400 font-bold text-xs">
                <Info size={16} />
                <span>{t("box3_title")}</span>
              </div>
              <p className="text-xs text-slate-400 leading-relaxed">
                {t("box3_p1")}
              </p>
              <div className="flex items-center gap-2">
                <span className="rounded bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 text-[10px] font-bold text-emerald-400">
                  {t("select_allowed_badge")}
                </span>
                <span className="rounded bg-sky-500/10 border border-sky-500/20 px-2 py-0.5 text-[10px] font-bold text-sky-400">
                  {t("with_allowed_badge")}
                </span>
              </div>
              <p className="text-[11px] text-slate-500">
                {t("box3_p2")}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SqlSchemaHelp;
