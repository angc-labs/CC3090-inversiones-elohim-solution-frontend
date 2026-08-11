"use client";

import { useState } from "react";
import { Search, Upload, Plus, Loader2, Package, Eye, EyeOff, Edit, Trash2, X, Download, FileText } from "lucide-react";
import { toast } from "sonner";
import { PortalModal } from "@/components/ui/PortalModal";
import * as XLSX from "xlsx";
import { uploadToCloudinary } from "@/lib/cloudinary";
import {
  crearPlatformProducto,
  crearPlatformProductosBulk,
  actualizarPlatformProducto,
  eliminarPlatformProducto,
  type PlatformProductoDto,
  type SucursalDto,
  type CrearPlatformProductoBulkInput,
} from "@/lib/api/admin";
import type { TCategoria } from "@/types";

interface ProductosTabProps {
  token: string;
  productos: PlatformProductoDto[];
  loadingProductos: boolean;
  categorias: TCategoria[];
  sucursales: SucursalDto[];
  esAdmin: boolean;
  hasCloudinary: boolean;
  onRefresh: () => void;
}

export function ProductosTab({
  token,
  productos,
  loadingProductos,
  categorias,
  sucursales,
  esAdmin,
  hasCloudinary,
  onRefresh,
}: ProductosTabProps) {
  // Search queries
  const [productSearchQuery, setProductSearchQuery] = useState("");

  // Modals
  const [isProductoModalOpen, setIsProductoModalOpen] = useState(false);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [isColumnMappingModalOpen, setIsColumnMappingModalOpen] = useState(false);

  // Edits
  const [selectedProducto, setSelectedProducto] = useState<PlatformProductoDto | null>(null);
  const [parsedProducts, setParsedProducts] = useState<CrearPlatformProductoBulkInput[]>([]);
  const [isImporting, setIsImporting] = useState(false);
  
  // Column mapping
  const [detectedColumns, setDetectedColumns] = useState<string[]>([]);
  const [columnMapping, setColumnMapping] = useState<Record<string, string>>({
    nombre: "",
    precioDetalle: "",
    precioMayoreo: "",
    sku: "",
    stockActual: "",
    descripcion: "",
    categoriaId: "",
    imagenUrl: "",
    stockMinimo: "",
  });

  // Form
  const [productoForm, setProductoForm] = useState({
    nombre: "",
    precioMayoreo: 0,
    precioDetalle: 0,
    categoriaId: "",
    categoriaBuscada: "",
    sku: "",
    descripcion: "",
    imagenUrl: "",
    publicado: true,
    stockMinimo: 0,
  });

  const [stockSucursalesMap, setStockSucursalesMap] = useState<Record<string, number>>({});
  const [mostrarDropdownCategorias, setMostrarDropdownCategorias] = useState(false);

  const handleOpenProductoModal = (prod: PlatformProductoDto | null = null) => {
    if (prod) {
      setSelectedProducto(prod);
      setProductoForm({
        nombre: prod.nombre,
        precioMayoreo: prod.precioMayoreo,
        precioDetalle: prod.precioDetalle,
        categoriaId: prod.categoriaId ?? "",
        categoriaBuscada: categorias.find(c => c.id === prod.categoriaId)?.nombreCategoria ?? prod.categoriaId ?? "",
        sku: prod.sku ?? "",
        descripcion: prod.descripcion ?? "",
        imagenUrl: prod.imagenUrl ?? "",
        publicado: prod.publicado,
        stockMinimo: prod.stockMinimo,
      });
      const map: Record<string, number> = {};
      prod.inventarios?.forEach((i) => {
        map[i.sucursalId] = i.stock;
      });
      setStockSucursalesMap(map);
    } else {
      setSelectedProducto(null);
      setProductoForm({
        nombre: "",
        precioMayoreo: 0,
        precioDetalle: 0,
        categoriaId: "",
        categoriaBuscada: "",
        sku: "",
        descripcion: "",
        imagenUrl: "",
        publicado: true,
        stockMinimo: 0,
      });
      setStockSucursalesMap({});
    }
    setIsProductoModalOpen(true);
  };

  const handleSubmitProducto = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) return;

    const stockSucursales = Object.entries(stockSucursalesMap).map(([sucursalId, stock]) => ({
      sucursalId,
      stock: Number(stock) || 0,
    }));

    const payload = {
      nombre: productoForm.nombre,
      precioMayoreo: Number(productoForm.precioMayoreo),
      precioDetalle: Number(productoForm.precioDetalle),
      categoriaId: productoForm.categoriaId || null,
      sku: productoForm.sku || null,
      descripcion: productoForm.descripcion || null,
      imagenUrl: productoForm.imagenUrl || null,
      publicado: productoForm.publicado,
      stockMinimo: Number(productoForm.stockMinimo) || 0,
      stockSucursales,
    };

    try {
      if (selectedProducto) {
        await actualizarPlatformProducto(token, selectedProducto.id, payload);
        toast.success("Producto modificado exitosamente");
      } else {
        await crearPlatformProducto(token, payload);
        toast.success("Producto creado exitosamente");
      }
      setIsProductoModalOpen(false);
      onRefresh();
    } catch (err) {
      toast.error("Error al guardar el producto");
    }
  };

  const handleTogglePublicadoProducto = async (prod: PlatformProductoDto) => {
    if (!token) return;

    try {
      const payload = {
        nombre: prod.nombre,
        precioMayoreo: prod.precioMayoreo,
        precioDetalle: prod.precioDetalle,
        categoriaId: prod.categoriaId,
        sku: prod.sku,
        descripcion: prod.descripcion,
        imagenUrl: prod.imagenUrl,
        publicado: !prod.publicado,
      };
      const updated = await actualizarPlatformProducto(token, prod.id, payload);
      toast.success(`Producto ${updated.publicado ? "visible" : "oculto"} en el catálogo`);
      onRefresh();
    } catch (err) {
      toast.error("Error al cambiar la visibilidad");
    }
  };

  const handleDeleteProducto = async (id: string) => {
    if (!token || !window.confirm("¿Estás seguro de que deseas eliminar este producto?")) return;

    try {
      await eliminarPlatformProducto(token, id);
      toast.success("Producto eliminado exitosamente");
      onRefresh();
    } catch (err) {
      toast.error("Error al eliminar el producto");
    }
  };

  // Import Excel templates
  const downloadTemplate = (format: "csv" | "xlsx") => {
    const templateData = [
      {
        Nombre: "Producto Ejemplo 1",
        Descripcion: "Descripción detallada del producto ejemplo 1",
        Sku: "SKU-EJEMPLO-01",
        PrecioDetalle: 120.5,
        PrecioMayoreo: 95.0,
        StockActual: 50,
        StockMinimo: 5,
        CategoriaId: "",
        Publicado: true,
        ImagenUrl: "https://ejemplo.com/imagen.jpg",
      },
      {
        Nombre: "Producto Ejemplo 2",
        Descripcion: "Descripción detallada del producto ejemplo 2",
        Sku: "SKU-EJEMPLO-02",
        PrecioDetalle: 45.0,
        PrecioMayoreo: 35.0,
        StockActual: 100,
        StockMinimo: 10,
        CategoriaId: "",
        Publicado: false,
        ImagenUrl: "",
      },
    ];

    const worksheet = XLSX.utils.json_to_sheet(templateData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Plantilla Productos");
    XLSX.writeFile(workbook, `plantilla_importacion_productos.${format}`, {
      bookType: format === "xlsx" ? "xlsx" : "csv",
    });
    toast.success(`Plantilla descargada en formato ${format.toUpperCase()}`);
  };

  const handleImportFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (evt) => {
      try {
        const data = evt.target?.result;
        const workbook = XLSX.read(data, { type: "binary" });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const json = XLSX.utils.sheet_to_json<any>(worksheet);

        if (json.length === 0) {
          toast.error("El archivo está vacío o no contiene filas de datos.");
          return;
        }

        // Extract detected columns from the file
        const detectedCols = Object.keys(json[0]);
        setDetectedColumns(detectedCols);

        // Validate headers
        const requiredColumns = ["Nombre", "PrecioDetalle", "PrecioMayoreo"];
        const firstRow = json[0];
        const missing = requiredColumns.filter((col) => !(col in firstRow));
        if (missing.length > 0) {
          toast.error(`Columnas requeridas faltantes: ${missing.join(", ")}`);
          return;
        }

        // Map excel data
        const productsToCreate: CrearPlatformProductoBulkInput[] = json.map((row, index) => {
          const nombre = String(row.Nombre || "").trim();
          if (!nombre) {
            throw new Error(`Fila ${index + 2}: El 'Nombre' es requerido.`);
          }

          const precioDetalle = parseFloat(row.PrecioDetalle);
          if (isNaN(precioDetalle) || precioDetalle < 0) {
            throw new Error(`Fila ${index + 2}: El 'PrecioDetalle' debe ser un número válido >= 0.`);
          }

          const precioMayoreo = parseFloat(row.PrecioMayoreo);
          if (isNaN(precioMayoreo) || precioMayoreo < 0) {
            throw new Error(`Fila ${index + 2}: El 'PrecioMayoreo' debe ser un número válido >= 0.`);
          }

          const stockActual = parseInt(row.StockActual || "0", 10);
          const stockMinimo = parseInt(row.StockMinimo || "0", 10);

          return {
            nombre,
            descripcion: row.Descripcion ? String(row.Descripcion) : null,
            sku: row.Sku ? String(row.Sku) : null,
            precioDetalle,
            precioMayoreo,
            stockActual: isNaN(stockActual) ? 0 : stockActual,
            stockMinimo: isNaN(stockMinimo) ? 0 : stockMinimo,
            categoriaId: row.CategoriaId ? String(row.CategoriaId) : null,
            publicado:
              row.Publicado === undefined
                ? true
                : String(row.Publicado).toLowerCase() === "true" ||
                  row.Publicado === true ||
                  row.Publicado === 1,
            imagenUrl: row.ImagenUrl ? String(row.ImagenUrl) : null,
          };
        });

        setParsedProducts(productsToCreate);
        toast.success(`Archivo cargado con éxito. ${productsToCreate.length} productos listos para importar.`);
      } catch (err: any) {
        toast.error(err.message || "Error al procesar el archivo.");
      }
    };
    reader.readAsBinaryString(file);
  };

  const handleConfirmImport = async () => {
    if (!token || parsedProducts.length === 0) return;

    setIsImporting(true);
    try {
      await crearPlatformProductosBulk(token, parsedProducts);
      toast.success(`¡Carga masiva completada!`);
      setIsImportModalOpen(false);
      setParsedProducts([]);
      onRefresh();
    } catch (err) {
      toast.error("Error al importar productos al servidor.");
    } finally {
      setIsImporting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-black text-white">Productos</h2>
          <p className="text-xs text-slate-400">
            Administra catálogo de productos, precios y visualiza stocks totales
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={14} />
            <input
              type="text"
              placeholder="Filtrar por nombre o SKU..."
              value={productSearchQuery}
              onChange={(e) => setProductSearchQuery(e.target.value)}
              className="h-9 w-full pl-9 pr-3 rounded-lg border border-slate-800 bg-slate-900/40 text-xs placeholder:text-slate-500 text-slate-100 outline-none focus:border-[#22D3A6]/40"
            />
          </div>
          {esAdmin && (
            <>
              <button
                onClick={() => setIsImportModalOpen(true)}
                className="h-9 px-4 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-100 text-xs font-bold transition-all flex items-center gap-2 cursor-pointer border border-slate-750 shrink-0"
              >
                <Upload size={16} />
                <span>Importar Productos</span>
              </button>
              <button
                onClick={() => handleOpenProductoModal()}
                className="h-9 px-4 rounded-xl bg-[#22D3A6] hover:bg-[#1ebda1] text-slate-950 text-xs font-bold transition-all flex items-center gap-2 cursor-pointer border-none shrink-0"
              >
                <Plus size={16} />
                <span>Nuevo Producto</span>
              </button>
            </>
          )}
        </div>
      </div>

      {loadingProductos ? (
        <div className="h-48 flex items-center justify-center">
          <Loader2 className="animate-spin text-[#22D3A6]" size={32} />
        </div>
      ) : productos.length === 0 ? (
        <div className="rounded-xl border border-dashed border-slate-800 p-12 text-center space-y-3">
          <Package className="mx-auto text-slate-600" size={40} />
          <p className="text-sm text-slate-400">No se encontraron productos registrados.</p>
        </div>
      ) : (
        <div className="rounded-xl border border-slate-900 bg-slate-950/20 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-slate-900 bg-slate-950/60 text-slate-400 uppercase font-bold tracking-wider">
                  <th className="p-4">Nombre</th>
                  <th className="p-4">SKU</th>
                  <th className="p-4">Precio Detalle</th>
                  <th className="p-4">Precio Mayoreo</th>
                  <th className="p-4 text-center">Stock Total</th>
                  <th className="p-4">Publicado</th>
                  {esAdmin && <th className="p-4 text-right">Acciones</th>}
                </tr>
              </thead>
              <tbody>
                {productos
                  .filter(
                    (p) =>
                      p.nombre.toLowerCase().includes(productSearchQuery.toLowerCase()) ||
                      (p.sku && p.sku.toLowerCase().includes(productSearchQuery.toLowerCase()))
                  )
                  .map((p) => (
                    <tr
                      key={p.id}
                      className="border-b border-slate-900/55 hover:bg-slate-950/30 transition-all"
                    >
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          {p.imagenUrl ? (
                            <img
                              src={p.imagenUrl}
                              alt={p.nombre}
                              className="h-8 w-8 rounded bg-slate-900 object-cover"
                            />
                          ) : (
                            <div className="h-8 w-8 rounded bg-slate-900 flex items-center justify-center text-slate-600">
                              <Package size={14} />
                            </div>
                          )}
                          <div>
                            <p className="font-bold text-white text-xs leading-tight">{p.nombre}</p>
                            <p className="text-[10px] text-slate-500 truncate max-w-xs">{p.descripcion}</p>
                          </div>
                        </div>
                      </td>
                      <td className="p-4 text-slate-400 font-mono">{p.sku || "—"}</td>
                      <td className="p-4 text-white font-semibold">Q{p.precioDetalle.toFixed(2)}</td>
                      <td className="p-4 text-slate-350">Q{p.precioMayoreo.toFixed(2)}</td>
                      <td className="p-4 text-center font-bold text-[#38BDF8]">{p.stockTotal} uds</td>
                      <td className="p-4">
                        <button
                          disabled={!esAdmin}
                          onClick={() => handleTogglePublicadoProducto(p)}
                          className={`p-1.5 rounded-lg transition-all border-none bg-transparent cursor-pointer ${
                            p.publicado ? "text-[#22D3A6] hover:text-[#22D3A6]/70" : "text-slate-600 hover:text-slate-400"
                          }`}
                        >
                          {p.publicado ? <Eye size={16} /> : <EyeOff size={16} />}
                        </button>
                      </td>
                      {esAdmin && (
                        <td className="p-4 text-right space-x-2">
                          <button
                            onClick={() => handleOpenProductoModal(p)}
                            className="p-2 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white transition-all cursor-pointer border-none"
                          >
                            <Edit size={12} />
                          </button>
                          <button
                            onClick={() => handleDeleteProducto(p.id)}
                            className="p-2 rounded-lg bg-slate-900 hover:bg-rose-950/30 text-slate-400 hover:text-rose-400 transition-all cursor-pointer border-none"
                          >
                            <Trash2 size={12} />
                          </button>
                        </td>
                      )}
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* PRODUCT FORM MODAL */}
      {isProductoModalOpen && (
        <PortalModal onClose={() => setIsProductoModalOpen(false)} ariaLabel={selectedProducto ? "Editar producto" : "Crear producto"}>
          <div className="w-full max-w-lg rounded-2xl border border-slate-800 bg-slate-950 p-6 shadow-2xl space-y-5 my-8 relative animate-fade-in">
            <button
              onClick={() => setIsProductoModalOpen(false)}
              className="absolute right-4 top-4 text-slate-500 hover:text-white cursor-pointer bg-transparent border-none p-0"
            >
              <X size={18} />
            </button>

            <div className="space-y-1">
              <h3 className="text-lg font-black text-white">
                {selectedProducto ? "Editar Producto" : "Agregar Producto"}
              </h3>
              <p className="text-xs text-slate-400">Llena los datos para el catálogo de productos</p>
            </div>

            <form onSubmit={handleSubmitProducto} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                    Nombre del Producto
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Ej. Harina Suave Premium"
                    value={productoForm.nombre}
                    onChange={(e) => setProductoForm({ ...productoForm, nombre: e.target.value })}
                    className="h-10 w-full rounded-lg border border-slate-800 bg-slate-900/60 px-3 text-xs text-slate-100 outline-none focus:border-[#38BDF8]"
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                    Código SKU
                  </label>
                  <input
                    type="text"
                    placeholder="Ej. HAR-SUA-01"
                    value={productoForm.sku}
                    onChange={(e) => setProductoForm({ ...productoForm, sku: e.target.value })}
                    className="h-10 w-full rounded-lg border border-slate-800 bg-slate-900/60 px-3 text-xs text-slate-100 outline-none focus:border-[#38BDF8]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                    Precio Detalle
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={productoForm.precioDetalle || ""}
                    onChange={(e) => setProductoForm({ ...productoForm, precioDetalle: Number(e.target.value) })}
                    className="h-10 w-full rounded-lg border border-slate-800 bg-slate-900/60 px-3 text-xs text-slate-100 outline-none focus:border-[#38BDF8]"
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                    Precio Mayoreo
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={productoForm.precioMayoreo || ""}
                    onChange={(e) => setProductoForm({ ...productoForm, precioMayoreo: Number(e.target.value) })}
                    className="h-10 w-full rounded-lg border border-slate-800 bg-slate-900/60 px-3 text-xs text-slate-100 outline-none focus:border-[#38BDF8]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5 relative">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                    Categoría
                  </label>
                  <input
                    type="text"
                    placeholder="Selecciona o escribe una categoría..."
                    value={productoForm.categoriaBuscada}
                    onChange={(e) => {
                      setProductoForm({ ...productoForm, categoriaBuscada: e.target.value });
                      setMostrarDropdownCategorias(true);
                    }}
                    onFocus={() => setMostrarDropdownCategorias(true)}
                    onBlur={() => {
                      setTimeout(() => setMostrarDropdownCategorias(false), 200);
                    }}
                    className="h-10 w-full rounded-lg border border-slate-800 bg-slate-900/60 px-3 text-xs text-slate-100 outline-none focus:border-[#38BDF8]"
                  />
                  {mostrarDropdownCategorias && productoForm.categoriaBuscada && categorias.filter(cat => cat.nombreCategoria.toLowerCase().includes(productoForm.categoriaBuscada.toLowerCase())).length > 0 && (
                    <div className="absolute top-full left-0 right-0 mt-1 bg-slate-900 border border-slate-800 rounded-lg z-50 max-h-40 overflow-y-auto shadow-lg">
                      {categorias
                        .filter(cat => cat.nombreCategoria.toLowerCase().includes(productoForm.categoriaBuscada.toLowerCase()))
                        .map(cat => (
                          <button
                            key={cat.id}
                            type="button"
                            onMouseDown={(e) => {
                              e.preventDefault();
                              setProductoForm({
                                ...productoForm,
                                categoriaBuscada: cat.nombreCategoria,
                                categoriaId: cat.id,
                              });
                              setMostrarDropdownCategorias(false);
                            }}
                            className="w-full px-3 py-2 text-left text-xs text-slate-200 hover:bg-slate-800 transition-all border-none bg-transparent cursor-pointer"
                          >
                            {cat.nombreCategoria}
                          </button>
                        ))}
                    </div>
                  )}
                  {productoForm.categoriaBuscada && !categorias.some(c => c.nombreCategoria.toLowerCase() === productoForm.categoriaBuscada.toLowerCase()) && (
                    <p className="text-[10px] text-slate-400 mt-1">💡 Se guardará como categoría personalizada</p>
                  )}
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                    Punto Crítico (Stock Mínimo)
                  </label>
                  <input
                    type="number"
                    min="0"
                    placeholder="Ej. 10"
                    value={productoForm.stockMinimo || 0}
                    onChange={(e) => setProductoForm({ ...productoForm, stockMinimo: Number(e.target.value) })}
                    className="h-10 w-full rounded-lg border border-slate-800 bg-slate-900/60 px-3 text-xs text-slate-100 outline-none focus:border-[#38BDF8]"
                  />
                </div>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                  Imagen URL
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    placeholder="https://cloudinary.com/ejemplo.jpg"
                    value={productoForm.imagenUrl}
                    onChange={(e) => setProductoForm({ ...productoForm, imagenUrl: e.target.value })}
                    className="flex-1 h-10 rounded-lg border border-slate-800 bg-slate-900/60 px-3 text-xs text-slate-100 outline-none focus:border-[#38BDF8]"
                  />
                  {hasCloudinary && (
                    <label className="h-10 px-4 rounded-xl bg-slate-800 hover:bg-slate-750 text-slate-200 text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer border border-slate-700 shrink-0">
                      <Upload size={14} />
                      <span>Subir</span>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={async (e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            try {
                              toast.loading("Subiendo imagen del producto...");
                              const url = await uploadToCloudinary(file, token);
                              setProductoForm((prev) => ({ ...prev, imagenUrl: url }));
                              toast.dismiss();
                              toast.success("Imagen de producto subida correctamente");
                            } catch (err) {
                              toast.dismiss();
                              toast.error(err instanceof Error ? err.message : "Error al subir imagen");
                            }
                          }
                        }}
                        className="hidden"
                      />
                    </label>
                  )}
                </div>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                  Descripción del Producto
                </label>
                <textarea
                  placeholder="Detalles sobre presentación, empaque, peso..."
                  value={productoForm.descripcion}
                  onChange={(e) => setProductoForm({ ...productoForm, descripcion: e.target.value })}
                  className="h-20 w-full rounded-lg border border-slate-800 bg-slate-900/60 p-3 text-xs text-slate-100 outline-none focus:border-[#38BDF8] resize-none"
                />
              </div>

              <div className="flex flex-col gap-2">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                  Stock por Sucursal
                </label>
                <div className="space-y-2 max-h-40 overflow-y-auto pr-1 border border-slate-800 bg-slate-900/40 p-3 rounded-lg">
                  {sucursales.map((suc) => (
                    <div key={suc.id} className="flex items-center justify-between gap-4">
                      <span className="text-xs text-slate-300 font-medium truncate max-w-[200px]">{suc.nombre}</span>
                      <input
                        type="number"
                        min="0"
                        placeholder="0"
                        value={stockSucursalesMap[suc.id] ?? ""}
                        onChange={(e) => {
                          const val = e.target.value === "" ? 0 : Number(e.target.value);
                          setStockSucursalesMap({
                            ...stockSucursalesMap,
                            [suc.id]: val,
                          });
                        }}
                        className="h-8 w-24 rounded border border-slate-800 bg-slate-950 px-2 text-xs text-slate-100 outline-none text-right focus:border-[#38BDF8]"
                      />
                    </div>
                  ))}
                  {sucursales.length === 0 && (
                    <p className="text-xs text-slate-500 italic">No hay sucursales registradas.</p>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-2.5">
                <input
                  type="checkbox"
                  id="prod-publicado"
                  checked={productoForm.publicado}
                  onChange={(e) => setProductoForm({ ...productoForm, publicado: e.target.checked })}
                  className="h-4 w-4 rounded border-slate-800 bg-slate-900 text-[#22D3A6] focus:ring-0 cursor-pointer"
                />
                <label htmlFor="prod-publicado" className="text-xs text-slate-350 cursor-pointer select-none">
                  Publicar en catálogo de clientes inmediatamente
                </label>
              </div>

              <button
                type="submit"
                className="h-11 w-full rounded-xl bg-[#22D3A6] hover:bg-[#1ebda1] text-slate-950 font-bold transition-all cursor-pointer border-none flex items-center justify-center"
              >
                <span>Guardar Producto</span>
              </button>
            </form>
          </div>
        </PortalModal>
      )}

      {/* BULK PRODUCT IMPORT MODAL */}
      {isImportModalOpen && (
        <PortalModal
          onClose={() => {
            setIsImportModalOpen(false);
            setParsedProducts([]);
          }}
          ariaLabel="Importar productos"
        >
          <div className="w-full max-w-2xl rounded-2xl border border-slate-800 bg-slate-950 p-6 shadow-2xl space-y-5 my-8 relative">
            <button
              onClick={() => {
                setIsImportModalOpen(false);
                setParsedProducts([]);
              }}
              className="absolute right-4 top-4 text-slate-500 hover:text-white cursor-pointer bg-transparent border-none p-0"
            >
              <X size={18} />
            </button>

            <div className="space-y-1">
              <h3 className="text-lg font-black text-white">Importación Masiva de Productos</h3>
              <p className="text-xs text-slate-400">Carga tus productos en lote usando archivos CSV o XLSX (Excel)</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 border border-slate-900 bg-slate-900/10 p-4 rounded-xl">
              <div className="space-y-2">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                  1. Descarga la Plantilla
                </span>
                <p className="text-[10px] text-slate-500 leading-relaxed font-medium">
                  Usa nuestras plantillas para asegurarte de que los encabezados y tipos de datos coincidan
                  exactamente.
                </p>
                <div className="flex gap-2">
                  <button
                    onClick={() => downloadTemplate("csv")}
                    className="h-8 px-3 rounded-lg bg-slate-850 hover:bg-slate-800 text-slate-300 text-[10px] font-bold uppercase tracking-wider transition-all flex items-center gap-1 cursor-pointer border border-slate-800"
                  >
                    <Download size={10} />
                    <span>Plantilla CSV</span>
                  </button>
                  <button
                    onClick={() => downloadTemplate("xlsx")}
                    className="h-8 px-3 rounded-lg bg-slate-850 hover:bg-slate-800 text-slate-300 text-[10px] font-bold uppercase tracking-wider transition-all flex items-center gap-1 cursor-pointer border border-slate-800"
                  >
                    <Download size={10} />
                    <span>Plantilla Excel</span>
                  </button>
                </div>
              </div>

              <div className="space-y-2">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                  2. Sube tu archivo (.csv / .xlsx)
                </span>
                <p className="text-[10px] text-slate-500 leading-relaxed font-medium">
                  Selecciona el archivo excel o delimitado por comas con tus productos listos para publicar.
                </p>
                <label className="h-8 px-3 rounded-lg bg-[#22D3A6] hover:bg-[#1ebda1] text-slate-950 text-[10px] font-bold uppercase tracking-wider transition-all flex items-center justify-center gap-1.5 cursor-pointer border-none w-full text-center">
                  <Upload size={12} />
                  <span>Seleccionar Archivo</span>
                  <input
                    type="file"
                    accept=".csv, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet, application/vnd.ms-excel"
                    onChange={handleImportFileChange}
                    className="hidden"
                  />
                </label>
              </div>
            </div>

            {parsedProducts.length > 0 && (
              <div className="space-y-2 border border-slate-900 bg-slate-900/10 p-4 rounded-xl">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                  Estandariza tus Columnas
                </span>
                <p className="text-[10px] text-slate-500 leading-relaxed font-medium">
                  Utiliza el formulario de mapeo de columnas, para validar su compatibilidad con el proyecto.
                </p>
                <button
                  onClick={() => setIsColumnMappingModalOpen(true)}
                  className="h-8 px-3 rounded-lg bg-[#22D3A6] hover:bg-[#1ebda1] text-slate-950 text-[10px] font-bold uppercase tracking-wider transition-all flex items-center justify-center gap-1.5 cursor-pointer border-none w-full"
                >
                  <span>Avanzar con el Formulario</span>
                </button>
              </div>
            )}


          </div>
        </PortalModal>
      )}

      {/* COLUMN MAPPING MODAL */}
      {isColumnMappingModalOpen && (
        <PortalModal
          onClose={() => setIsColumnMappingModalOpen(false)}
          ariaLabel="Mapear columnas"
        >
          <div className="w-full max-w-2xl rounded-2xl border border-slate-800 bg-slate-950 p-6 shadow-2xl space-y-5 my-8 relative">
            <button
              onClick={() => setIsColumnMappingModalOpen(false)}
              className="absolute right-4 top-4 text-slate-500 hover:text-white cursor-pointer bg-transparent border-none p-0"
            >
              <X size={18} />
            </button>

            <div className="space-y-1">
              <h3 className="text-lg font-black text-white">Mapeo de Columnas</h3>
              <p className="text-xs text-slate-400">Asigna las columnas de tu archivo a los campos del proyecto</p>
            </div>

            <div className="space-y-4">
              {/* Campos Requeridos */}
              <div className="space-y-3">
                <h4 className="text-xs font-bold text-[#22D3A6] uppercase tracking-wider">
                  * Campos Requeridos
                </h4>
                
                {["nombre", "precioDetalle", "precioMayoreo", "sku", "stockActual", "stockMinimo"].map((field) => (
                  <div key={field} className="flex items-center gap-3">
                    <label className="w-40 text-sm font-semibold text-white">
                      {field === "nombre" && "Nombre"}
                      {field === "precioDetalle" && "Precio Detalle"}
                      {field === "precioMayoreo" && "Precio Mayoreo"}
                      {field === "sku" && "SKU"}
                      {field === "stockActual" && "Stock Actual"}
                      {field === "stockMinimo" && "Stock Mínimo"}
                    </label>
                    <select
                      value={columnMapping[field]}
                      onChange={(e) => setColumnMapping({ ...columnMapping, [field]: e.target.value })}
                      className="flex-1 h-9 rounded-lg border border-slate-800 bg-slate-900/60 px-3 text-xs text-slate-100 outline-none focus:border-[#38BDF8] cursor-pointer"
                    >
                      <option value="">-- Seleccionar columna --</option>
                      {detectedColumns.map((col) => (
                        <option key={col} value={col}>
                          {col}
                        </option>
                      ))}
                    </select>
                    {columnMapping[field] && (
                      <span className="text-[#22D3A6] text-lg">✓</span>
                    )}
                  </div>
                ))}
              </div>

              {/* Campos Opcionales */}
              <div className="space-y-3 border-t border-slate-800 pt-4">
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                  Campos Opcionales
                </h4>
                
                {["descripcion", "categoriaId", "imagenUrl"].map((field) => (
                  <div key={field} className="flex items-center gap-3">
                    <label className="w-40 text-sm text-slate-300">
                      {field === "descripcion" && "Descripción"}
                      {field === "categoriaId" && "Categoría ID"}
                      {field === "imagenUrl" && "Imagen URL"}
                    </label>
                    <select
                      value={columnMapping[field]}
                      onChange={(e) => setColumnMapping({ ...columnMapping, [field]: e.target.value })}
                      className="flex-1 h-9 rounded-lg border border-slate-800 bg-slate-900/60 px-3 text-xs text-slate-100 outline-none focus:border-[#38BDF8] cursor-pointer"
                    >
                      <option value="">-- No asignada --</option>
                      {detectedColumns.map((col) => (
                        <option key={col} value={col}>
                          {col}
                        </option>
                      ))}
                    </select>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex gap-3 pt-4">
              <button
                onClick={() => setIsColumnMappingModalOpen(false)}
                className="flex-1 h-10 rounded-lg border border-slate-800 bg-slate-900/60 text-slate-300 hover:bg-slate-800 text-sm font-bold transition-all cursor-pointer"
              >
                Cancelar
              </button>
              <button
                onClick={() => {
                  const requiredFields = ["nombre", "precioDetalle", "precioMayoreo", "sku", "stockActual", "stockMinimo"];
                  const missingFields = requiredFields.filter(field => !columnMapping[field]);
                  
                  if (missingFields.length > 0) {
                    toast.error("Por favor asigna todos los campos requeridos antes de continuar");
                    return;
                  }
                  
                  toast.success("Mapeo aplicado correctamente");
                  setIsColumnMappingModalOpen(false);
                }}
                className="flex-1 h-10 rounded-lg bg-[#22D3A6] hover:bg-[#1ebda1] text-slate-950 text-sm font-bold transition-all cursor-pointer border-none"
              >
                Aplicar Mapeo
              </button>
            </div>
          </div>
        </PortalModal>
      )}
    </div>
  );
}

