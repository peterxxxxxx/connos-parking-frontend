import * as yup from 'yup'

export const loginSchema = yup.object({
  email: yup
    .string('El email debe ser texto')
    .email('Debe ser un email válido')
    .required('El email es requerido'),
  password: yup
    .string('La contraseña debe ser texto')
    .min(6, 'Mínimo 6 caracteres')
    .required('La contraseña es requerida'),
})

export const clientSchema = yup.object({
  name: yup
    .string('El nombre debe ser texto')
    .required('El nombre es requerido'),
  phone: yup.string().matches(/^\+?[0-9\s\-()]{10,}$/, 'Teléfono inválido'),
  email: yup
    .string()
    .email('Email inválido')
    .required('Email requerido'),
  address: yup.string(),
  vehicle: yup.object({
    plate: yup.string().required('Placa requerida'),
    brand: yup.string().required('Marca requerida'),
    model: yup.string(),
    year: yup.number(),
    color: yup.string(),
  }),
})

export const paymentSchema = yup.object({
  amount: yup
    .number('Debe ser un número')
    .positive('El monto debe ser positivo')
    .required('Monto requerido'),
  paymentDate: yup
    .date('Debe ser una fecha válida')
    .required('Fecha requerida'),
  coveredPeriod: yup.string().required('Período requerido'),
  comment: yup.string(),
})
