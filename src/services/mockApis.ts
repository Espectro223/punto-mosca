export const validarTelefonoMock = async (telefono: string): Promise<boolean> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      // Regla: Rechaza los teléfonos que tengan menos de 8 dígitos o que contengan letras.
      const isValid = /^[0-9]+$/.test(telefono) && telefono.length >= 8;
      resolve(isValid);
    }, 1500); // 1.5s delay
  });
};

export interface VerazResponse {
  estado: 'Aprobado' | 'Rechazado' | 'Auditoria';
  banderas: string[];
}

export const consultarVerazMock = async (_cliente: string, monto: number): Promise<VerazResponse> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      // Regla 1: Monto excesivo -> Auditoría
      if (monto > 500000) {
        resolve({
          estado: 'Auditoria',
          banderas: ['Monto excede umbral de seguridad ($500,000)'],
        });
        return;
      }

      const randomValue = Math.random();

      // Regla 2: 10% de chance -> Rechazo duro
      if (randomValue < 0.1) {
        resolve({
          estado: 'Rechazado',
          banderas: ['Información nula del buró de crédito'],
        });
        return;
      }

      // Regla 3: 20% de chance -> Auditoría (Riesgo evaluable)
      if (randomValue >= 0.1 && randomValue < 0.3) {
        resolve({
          estado: 'Auditoria',
          banderas: ['Deuda previa detectada en los últimos 6 meses'],
        });
        return;
      }

      // Regla 4: 70% de chance -> Flujo impecable
      resolve({
        estado: 'Aprobado',
        banderas: [],
      });
    }, 2000); // 2s delay
  });
};
