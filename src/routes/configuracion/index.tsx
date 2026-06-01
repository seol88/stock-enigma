import { component$, $, useSignal } from '@builder.io/qwik';
import type { DocumentHead } from '@builder.io/qwik-city';
import { authClient } from '../../lib/auth-client';

export default component$(() => {
  // Email states
  const newEmail = useSignal('');
  const emailLoading = useSignal(false);
  const emailError = useSignal('');
  const emailSuccess = useSignal('');

  // Password states
  const currentPassword = useSignal('');
  const newPassword = useSignal('');
  const confirmPassword = useSignal('');
  const passwordLoading = useSignal(false);
  const passwordError = useSignal('');
  const passwordSuccess = useSignal('');

  const handleUpdateEmail = $(async () => {
    if (!newEmail.value) {
      emailError.value = 'Por favor, ingresa el nuevo correo electrónico.';
      return;
    }
    emailLoading.value = true;
    emailError.value = '';
    emailSuccess.value = '';

    const { error } = await authClient.changeEmail({
      newEmail: newEmail.value,
    });

    if (error) {
      emailError.value = error.message || 'Error al cambiar el correo electrónico.';
      emailLoading.value = false;
    } else {
      emailSuccess.value = '¡Correo electrónico actualizado correctamente!';
      newEmail.value = '';
      emailLoading.value = false;
    }
  });

  const handleUpdatePassword = $(async () => {
    if (!currentPassword.value || !newPassword.value || !confirmPassword.value) {
      passwordError.value = 'Por favor, completa todos los campos de contraseña.';
      return;
    }
    if (newPassword.value !== confirmPassword.value) {
      passwordError.value = 'Las contraseñas nuevas no coinciden.';
      return;
    }
    if (newPassword.value.length < 6) {
      passwordError.value = 'La nueva contraseña debe tener al menos 6 caracteres.';
      return;
    }

    passwordLoading.value = true;
    passwordError.value = '';
    passwordSuccess.value = '';

    const { error } = await authClient.changePassword({
      currentPassword: currentPassword.value,
      newPassword: newPassword.value,
      revokeOtherSessions: true,
    });

    if (error) {
      passwordError.value = error.message || 'Error al cambiar la contraseña.';
      passwordLoading.value = false;
    } else {
      passwordSuccess.value = '¡Contraseña actualizada correctamente!';
      currentPassword.value = '';
      newPassword.value = '';
      confirmPassword.value = '';
      passwordLoading.value = false;
    }
  });

  return (
    <div class="max-w-4xl mx-auto space-y-8 p-4 md:p-6">
      <div>
        <h2 class="text-2xl font-black text-gray-800 tracking-tight">Configuración del Perfil</h2>
        <p class="text-sm text-gray-500 mt-1">Actualiza tu información de inicio de sesión y mantén tu cuenta segura.</p>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Cambiar Email */}
        <div class="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm space-y-4">
          <h3 class="font-bold text-gray-800 text-lg flex items-center gap-2">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-[#6B21A8]" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
            Correo Electrónico
          </h3>
          <p class="text-xs text-gray-500">Ingresa tu nueva dirección de correo electrónico. Deberás iniciar sesión nuevamente con el nuevo correo.</p>
          
          {emailError.value && (
            <div class="bg-red-50 text-red-600 p-3 rounded-xl text-xs border border-red-200">
              {emailError.value}
            </div>
          )}

          {emailSuccess.value && (
            <div class="bg-emerald-50 text-emerald-700 p-3 rounded-xl text-xs border border-emerald-200">
              {emailSuccess.value}
            </div>
          )}

          <div class="space-y-3">
            <div class="form-control w-full">
              <label class="label"><span class="label-text font-bold text-xs text-gray-600">Nuevo Correo Electrónico</span></label>
              <input 
                type="email" 
                placeholder="ejemplo@libreriaenigma.com" 
                value={newEmail.value}
                onInput$={(e) => newEmail.value = (e.target as HTMLInputElement).value}
                class="input input-bordered w-full rounded-xl text-sm border-gray-200 focus:ring-2 focus:ring-[#6B21A8]/20 focus:border-[#6B21A8] focus:outline-none bg-gray-50/50"
              />
            </div>
            
            <button 
              onClick$={handleUpdateEmail}
              disabled={emailLoading.value}
              class="btn w-full bg-[#6B21A8] hover:bg-[#581C87] text-white border-none rounded-xl font-bold shadow-md shadow-[#6B21A8]/10 text-sm py-2.5 h-auto min-h-0"
            >
              {emailLoading.value ? 'Guardando...' : 'Actualizar Correo'}
            </button>
          </div>
        </div>

        {/* Cambiar Contraseña */}
        <div class="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm space-y-4">
          <h3 class="font-bold text-gray-800 text-lg flex items-center gap-2">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-[#6B21A8]" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
            Contraseña
          </h3>
          <p class="text-xs text-gray-500">Mantén tu cuenta protegida cambiando tu contraseña periódicamente.</p>
          
          {passwordError.value && (
            <div class="bg-red-50 text-red-600 p-3 rounded-xl text-xs border border-red-200">
              {passwordError.value}
            </div>
          )}

          {passwordSuccess.value && (
            <div class="bg-emerald-50 text-emerald-700 p-3 rounded-xl text-xs border border-emerald-200">
              {passwordSuccess.value}
            </div>
          )}

          <div class="space-y-3">
            <div class="form-control w-full">
              <label class="label"><span class="label-text font-bold text-xs text-gray-600">Contraseña Actual</span></label>
              <input 
                type="password" 
                placeholder="••••••••" 
                value={currentPassword.value}
                onInput$={(e) => currentPassword.value = (e.target as HTMLInputElement).value}
                class="input input-bordered w-full rounded-xl text-sm border-gray-200 focus:ring-2 focus:ring-[#6B21A8]/20 focus:border-[#6B21A8] focus:outline-none bg-gray-50/50"
              />
            </div>
            
            <div class="form-control w-full">
              <label class="label"><span class="label-text font-bold text-xs text-gray-600">Nueva Contraseña</span></label>
              <input 
                type="password" 
                placeholder="Mínimo 6 caracteres" 
                value={newPassword.value}
                onInput$={(e) => newPassword.value = (e.target as HTMLInputElement).value}
                class="input input-bordered w-full rounded-xl text-sm border-gray-200 focus:ring-2 focus:ring-[#6B21A8]/20 focus:border-[#6B21A8] focus:outline-none bg-gray-50/50"
              />
            </div>

            <div class="form-control w-full">
              <label class="label"><span class="label-text font-bold text-xs text-gray-600">Confirmar Nueva Contraseña</span></label>
              <input 
                type="password" 
                placeholder="Repite la nueva contraseña" 
                value={confirmPassword.value}
                onInput$={(e) => confirmPassword.value = (e.target as HTMLInputElement).value}
                class="input input-bordered w-full rounded-xl text-sm border-gray-200 focus:ring-2 focus:ring-[#6B21A8]/20 focus:border-[#6B21A8] focus:outline-none bg-gray-50/50"
              />
            </div>
            
            <button 
              onClick$={handleUpdatePassword}
              disabled={passwordLoading.value}
              class="btn w-full bg-[#6B21A8] hover:bg-[#581C87] text-white border-none rounded-xl font-bold shadow-md shadow-[#6B21A8]/10 text-sm py-2.5 h-auto min-h-0"
            >
              {passwordLoading.value ? 'Guardando...' : 'Cambiar Contraseña'}
            </button>
          </div>
        </div>

      </div>
    </div>
  );
});

export const head: DocumentHead = {
  title: 'Configuración - Librería Enigma',
  meta: [{ name: 'description', content: 'Configuración del perfil de usuario y contraseña' }],
};
