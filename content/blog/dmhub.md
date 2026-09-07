---
title: "DMHub: Sobre Nosotros"
description: "Conoce cómo nació Distributors Marketplace Hub (DMHub) como un proyecto académico y cómo su arquitectura escalable puede gestionar operaciones mayoristas reales."
author: "Angel Chavez"
date: "2026-09-06"
tags: ["Arquitectura", "B2B", "Universidad"]
faq:
  - question: "¿DMHub es software libre?"
    answer: "DMHub nació como un proyecto académico, por lo que su código fuente fundacional tiene propósitos educativos, aunque su arquitectura es apta para entornos empresariales o self-hosted"
  - question: "¿Cuáles son las tecnologías principales?"
    answer: "Utiliza Next.js para el frontend, .NET (C#) para el backend y PostgreSQL para la base de datos."
---

Distributors Marketplace Hub (**DMHub**) nace de una necesidad real identificada a partir de la experiencia de un pariente de uno de los integrantes del equipo de desarrollo, quien administra una distribuidora de productos de primera necesidad, como alimentos, bebidas, jabón y otros artículos. El negocio se dedica tanto a la venta al por mayor como a la venta directa al consumidor.

Sin embargo, la empresa no contaba con una presencia comercial significativa en Internet y enfrentaba necesidades reales, como los largos tiempos de atención en caja y la dificultad para alcanzar los volúmenes mínimos de venta requeridos por los proveedores. Rápidamente nos dimos cuenta de que estos mismos problemas se repetían en muchos otros negocios similares. Aunque no necesariamente se dedicaban a la venta de productos alimenticios, sí experimentaban dificultades relacionadas con la gestión de inventario, los procesos de caja, el cumplimiento de metas comerciales y la presencia en Internet.

Como propuesta de valor, nuestra solución con DMHub consistió en diseñar una plataforma multi-tenant que pudiera ser utilizada de manera sencilla y flexible tanto por los administradores de los negocios como por sus clientes en línea. No pretendemos competir directamente con una plataforma de comercio electrónico dedicada y desarrollada a la medida. Nuestro objetivo es estandarizar y facilitar el acceso al mundo digital para aquellos negocios que aún no cuentan con una estrategia o presencia sólida en línea, permitiéndoles dar ese salto y disponer de un espacio donde puedan experimentar y crecer de forma segura.

Para lograrlo, aplicamos estándares y prácticas de nivel empresarial, buscando que los conceptos teóricos de los sistemas distribuidos pudieran trasladarse a problemas reales relacionados con la logística, la gestión de inventario y los procesos de venta.

## Capacidades Principales

DMHub permite a las empresas centralizar sus operaciones a través de un ecosistema que conecta dos pilares fundamentales:

### 1. Multi-tienda y Multi-sucursal
A diferencia de un e-commerce B2C tradicional, DMHub entiende que los mayoristas operan con múltiples nodos de distribución. El sistema permite:

- **Separación de inventarios** físicos y virtuales.
- Asignación de catálogos específicos por sucursal.
- Control unificado bajo un único panel de administración.

### 2. RBAC
La seguridad y delegación de tareas es crítica. El proyecto implementa una matriz estricta:

- **Administrador**: control total del flujo de caja, integraciones y catálogos globales.
- **Cajero/Vendedor**: optimizado para agilidad en piso de venta, permitiendo cotizaciones rápidas.
- **Cliente B2B**: portales de autoservicio para revisar facturas, reordenar por lotes y consultar límites de crédito.

## El Futuro del Proyecto

Al ser un proyecto universitario, DMHub sirve como campo de pruebas para implementar nuevas tecnologías con un efoque de negocio real.

Estamos emocionados de seguir evolucionando esta plataforma.
