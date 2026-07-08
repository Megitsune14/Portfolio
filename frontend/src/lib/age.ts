export function getAge(birthDate: Date, referenceDate = new Date()): number {
  let age = referenceDate.getFullYear() - birthDate.getFullYear()
  const monthDiff = referenceDate.getMonth() - birthDate.getMonth()
  const dayDiff = referenceDate.getDate() - birthDate.getDate()

  if (monthDiff < 0 || (monthDiff === 0 && dayDiff < 0)) {
    age -= 1
  }

  return age
}

export const BIRTH_DATE = new Date(2002, 11, 21)
