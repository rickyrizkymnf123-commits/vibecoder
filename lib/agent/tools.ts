export interface GeminiFunctionDeclaration {
  name: string;
  description: string;
  parameters: {
    type: 'OBJECT';
    properties: Record<string, any>;
    required?: string[];
  };
}

export const AGENT_TOOLS: GeminiFunctionDeclaration[] = [
  {
    name: 'write_file',
    description: 'Menulis atau membuat berkas fisik baru ke dalam filesystem workspace proyek. Seluruh berkas pendukung aplikasi (HTML, CSS, JS, TS, JSON, SQL) harus benar-benar ditulis ke disk.',
    parameters: {
      type: 'OBJECT',
      properties: {
        path: {
          type: 'STRING',
          description: 'Path relatif berkas di dalam workspace proyek, misalnya package.json, server.js, public/index.html, lib/db.js, data/records.json, dll.'
        },
        content: {
          type: 'STRING',
          description: 'Isi lengkap kode sumber yang akan ditulis ke dalam berkas.'
        }
      },
      required: ['path', 'content']
    }
  },
  {
    name: 'read_file',
    description: 'Membaca isi berkas fisik yang ada di dalam filesystem workspace.',
    parameters: {
      type: 'OBJECT',
      properties: {
        path: {
          type: 'STRING',
          description: 'Path relatif berkas yang ingin dibaca dari workspace proyek.'
        }
      },
      required: ['path']
    }
  },
  {
    name: 'edit_file',
    description: 'Memperbaiki atau mengganti potongan teks/kode tertentu pada berkas yang sudah ada di workspace.',
    parameters: {
      type: 'OBJECT',
      properties: {
        path: {
          type: 'STRING',
          description: 'Path relatif berkas yang ingin diedit, misal server.js atau lib/views.js'
        },
        target_content: {
          type: 'STRING',
          description: 'Potongan teks atau kode lama yang persis akan diganti'
        },
        replacement_content: {
          type: 'STRING',
          description: 'Potongan teks atau kode baru pengganti'
        }
      },
      required: ['path', 'target_content', 'replacement_content']
    }
  },
  {
    name: 'bash',
    description: 'Mengeksekusi perintah terminal shell di dalam folder workspace proyek (misal: node --check server.js atau node test.mjs). Mengembalikan stdout, stderr, dan exit code.',
    parameters: {
      type: 'OBJECT',
      properties: {
        command: {
          type: 'STRING',
          description: 'Perintah shell yang akan dieksekusi, misal node --check server.js.'
        }
      },
      required: ['command']
    }
  },
  {
    name: 'run_tests',
    description: 'Menjalankan rangkaian pengujian otomatis terhadap aplikasi di workspace untuk memvalidasi fungsionalitas dan routing API.',
    parameters: {
      type: 'OBJECT',
      properties: {
        test_type: {
          type: 'STRING',
          description: 'Tipe pengujian yang dijalankan (default: "all").'
        }
      }
    }
  },
  {
    name: 'todo_write',
    description: 'Membuat atau memperbarui daftar tugas pengerjaan proyek (daftar Todo) agar pengguna dapat melihat progres pengerjaan secara bertahap.',
    parameters: {
      type: 'OBJECT',
      properties: {
        todos: {
          type: 'ARRAY',
          description: 'Daftar tugas pengerjaan.',
          items: {
            type: 'OBJECT',
            properties: {
              id: { type: 'STRING', description: 'ID unik tugas, misal 1' },
              title: { type: 'STRING', description: 'Judul tugas pengerjaan' },
              status: {
                type: 'STRING',
                description: 'Status: "pending", "in_progress", atau "completed"'
              }
            },
            required: ['title', 'status']
          }
        }
      },
      required: ['todos']
    }
  },
  {
    name: 'publish_app',
    description: 'Mempublikasikan aplikasi yang sudah selesai dibangun dan lolos pengujian ke antarmuka interactive live preview.',
    parameters: {
      type: 'OBJECT',
      properties: {
        appName: {
          type: 'STRING',
          description: 'Nama aplikasi resmi, misalnya "Kasir POS & Toko Sembako"'
        },
        slug: {
          type: 'STRING',
          description: 'Slug URL aplikasi, misalnya "kasir-pos-sembako"'
        }
      },
      required: ['appName', 'slug']
    }
  }
];

export function getOpenAiTools() {
  return [
    {
      type: 'function' as const,
      function: {
        name: 'write_file',
        description: 'Menulis berkas fisik ke disk workspace proyek. Buat kode nyata, lengkap, dan modular.',
        parameters: {
          type: 'object',
          properties: {
            path: {
              type: 'string',
              description: 'Path relatif berkas, misal package.json, server.js, public/index.html, data/records.json'
            },
            content: {
              type: 'string',
              description: 'Isi kode sumber berkas lengkap'
            }
          },
          required: ['path', 'content']
        }
      }
    },
    {
      type: 'function' as const,
      function: {
        name: 'todo_write',
        description: 'Membuat atau memperbarui daftar rencana tugas kerja (Todo list)',
        parameters: {
          type: 'object',
          properties: {
            todos: {
              type: 'array',
              description: 'Daftar tugas',
              items: {
                type: 'object',
                properties: {
                  id: { type: 'string' },
                  title: { type: 'string' },
                  status: { type: 'string', enum: ['pending', 'in_progress', 'completed'] }
                },
                required: ['title', 'status']
              }
            }
          },
          required: ['todos']
        }
      }
    },
    {
      type: 'function' as const,
      function: {
        name: 'bash',
        description: 'Eksekusi perintah terminal shell di workspace, misal node --check server.js',
        parameters: {
          type: 'object',
          properties: {
            command: {
              type: 'string',
              description: 'Perintah shell terminal'
            }
          },
          required: ['command']
        }
      }
    },
    {
      type: 'function' as const,
      function: {
        name: 'read_file',
        description: 'Membaca isi berkas fisik dari workspace',
        parameters: {
          type: 'object',
          properties: {
            path: {
              type: 'string',
              description: 'Path relatif berkas yang ingin dibaca'
            }
          },
          required: ['path']
        }
      }
    },
    {
      type: 'function' as const,
      function: {
        name: 'edit_file',
        description: 'Mengedit atau memperbaiki sebagian teks/kode di berkas yang sudah ada',
        parameters: {
          type: 'object',
          properties: {
            path: {
              type: 'string',
              description: 'Path relatif berkas'
            },
            target_content: {
              type: 'string',
              description: 'Teks/kode lama yang ingin diganti'
            },
            replacement_content: {
              type: 'string',
              description: 'Teks/kode baru pengganti'
            }
          },
          required: ['path', 'target_content', 'replacement_content']
        }
      }
    },
    {
      type: 'function' as const,
      function: {
        name: 'run_tests',
        description: 'Menjalankan rangkaian pengujian otomatis terhadap berkas di workspace',
        parameters: {
          type: 'object',
          properties: {
            test_type: {
              type: 'string',
              description: 'Tipe pengujian (default: "all")'
            }
          }
        }
      }
    },
    {
      type: 'function' as const,
      function: {
        name: 'publish_app',
        description: 'Menerbitkan aplikasi web yang telah dibangun ke interactive live preview publik',
        parameters: {
          type: 'object',
          properties: {
            appName: {
              type: 'string',
              description: 'Nama aplikasi resmi'
            },
            slug: {
              type: 'string',
              description: 'Slug URL unik aplikasi (huruf kecil dan tanda minus)'
            }
          },
          required: ['appName', 'slug']
        }
      }
    }
  ];
}

